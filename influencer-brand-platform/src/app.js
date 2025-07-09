const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
const signinRoute = require('./routes/signin');
const signupRoute = require('./routes/signup');

app.use('/signin', signinRoute);
app.use('/signup', signupRoute);

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});