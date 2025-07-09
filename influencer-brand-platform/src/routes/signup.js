const express = require('express');
const router = express.Router();

// Route for rendering the Sign Up page
router.get('/', (req, res) => {
    res.sendFile('signup.html', { root: 'public' });
});

// Route for handling Sign Up form submission
router.post('/', (req, res) => {
    const { username, email, password } = req.body;

    // Here you would typically add validation and user registration logic
    // For example, check if the user already exists, hash the password, etc.

    // Simulating successful registration
    res.status(201).json({ message: 'User registered successfully!' });
});

module.exports = router;