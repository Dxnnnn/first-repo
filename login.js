// Seed a default admin account if none exists, and ensure it's always verified
(function seedAdmin() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminIndex = users.findIndex(u => u.email === 'admin@example.com' || u.role === 'admin');

    if (adminIndex === -1) {
        // Create admin account if it doesn't exist
        users.push({
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            verified: true // Admin account is verified by default
        });
    } else {
        // Ensure existing admin account is always verified
        users[adminIndex].verified = true;
        users[adminIndex].role = 'admin';
        if (!users[adminIndex].email) {
            users[adminIndex].email = 'admin@example.com';
        }
        if (!users[adminIndex].password) {
            users[adminIndex].password = 'admin123';
        }
    }
    
    localStorage.setItem('users', JSON.stringify(users));
})();

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Check verification status
        // Admin accounts can always log in (bypass verification check)
        if (user.role === 'admin') {
            // Ensure admin account is always verified
            if (user.verified !== true) {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userIndex = users.findIndex(u => u.email === user.email);
                if (userIndex !== -1) {
                    users[userIndex].verified = true;
                    localStorage.setItem('users', JSON.stringify(users));
                    user.verified = true;
                }
            }
        } else {
            // Regular users MUST be verified to log in
            // If verified is false, undefined, or not true, block login
            if (user.verified !== true) {
                alert('Your account has not been verified yet. Please wait for admin verification before logging in.');
                return;
            }
        }
        
        // Create a JWT-like token (simulated)
        const token = btoa(JSON.stringify({
            email: user.email,
            role: user.role || 'user',
            timestamp: Date.now()
        }));
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect all users to admin.html (same page for both admin and regular users)
        window.location.href = 'admin.html';
    } else {
        alert('Invalid email or password. Please try again.');
    }
});
