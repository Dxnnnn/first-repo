// Registration form handler
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate inputs
    if (!firstName || !lastName || !email || !password) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        alert('An account with this email already exists. Please use a different email or try logging in.');
        return;
    }
    
    // Create new user object
    const newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        role: 'user', // Default role for new registrations
        verified: false // New accounts are not verified by default
    };
    
    // Add user to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Show success message
    alert('Registration successful! Your account is pending admin verification. You will be able to log in once an admin verifies your account.');
    
    // Redirect to login page
    window.location.href = 'Login.html';
});
