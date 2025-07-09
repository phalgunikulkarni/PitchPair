const express = require('express');
const router = express.Router();

// Render the Sign In page
router.get('/', (req, res) => {
    res.sendFile('signin.html', { root: 'public' });
});

// Handle Sign In form submission
router.post('/', (req, res) => {
    const { username, password } = req.body;

    // Here you would typically validate the credentials and authenticate the user
    // For demonstration purposes, we'll assume a successful login
    if (username === 'test' && password === 'password') {
        res.redirect('/'); // Redirect to the main page on successful login
    } else {
        res.status(401).send('Invalid credentials'); // Send an error response for invalid login
    }
});

module.exports = router;