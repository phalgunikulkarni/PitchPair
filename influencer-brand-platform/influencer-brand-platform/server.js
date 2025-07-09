const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

// Import routes
const signinRoutes = require('./src/routes/signin');
const signupRoutes = require('./src/routes/signup');

// Use routes
app.use('/api/signin', signinRoutes);
app.use('/api/signup', signupRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});