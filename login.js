// Seed a default admin account if none exists
(function seedAdmin() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const hasAdmin = users.some(u => u.role === 'admin');

    if (!hasAdmin) {
        users.push({
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
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
        // Create a JWT-like token (simulated)
        const token = btoa(JSON.stringify({
            email: user.email,
            role: user.role || 'user',
            timestamp: Date.now()
        }));
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect based on role
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    } else {
        alert('Invalid email or password. Please try again.');
    }
});
