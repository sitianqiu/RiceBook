const bcrypt = require('bcrypt');
const User = require('./models/User');
const Profile = require('./models/Profile');
const express = require('express');

// Middleware
const isLoggedIn = (req, res, next) => {
    if (!req.session || !req.session.user) {
        console.error('Unauthorized request: No active session');
        return res.status(401).send({ error: 'Unauthorized' });
    }
    req.user = req.session.user;
    next();
};


// Login
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send({ error: 'Invalid password' });

        // Save user to session
        req.session.user = { username: user.username };
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).send({ error: 'Failed to save session' });
            }

            console.log('Session after login:', req.session);
            res.status(200).send({ username: user.username, result: 'success' });
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

// Logout
const logout = (req, res) => {
    if (!req.session) {
        console.warn('No active session to log out');
        res.clearCookie('connect.sid');
        return res.status(200).send({ message: 'Logged out successfully (no active session)' });
    }

    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send({ error: 'Failed to log out' });
        }

        // Clear the cookie
        res.clearCookie('connect.sid', {
            path: '/', 
            httpOnly: true,
            secure: false, // Change to true if using HTTPS
            sameSite: 'lax',
        });
        console.log('User logged out successfully');
        res.status(200).send({ message: 'Logged out successfully' });
    });
};

// Register
const register = async (req, res) => {
    const { username, email, dob, phone, zipcode, password, headline, avatar } = req.body;

    try {
        // Validate required fields
        if (!username || !email || !password || !phone || !zipcode || !dob) {
            return res.status(400).send({ error: 'Missing required fields.' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).send({ error: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save User
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            salt,
            passwordLength: password.length,
            created: new Date(),
        });
        await newUser.save();

        // Create and save Profile
        const newProfile = new Profile({
            userId: newUser._id,
            username,
            email,
            dob: dob,
            phone,
            zipcode,
            headline: headline || 'Hello World!',
            avatar: avatar || '/profile.jpeg',
        });
        await newProfile.save();
        req.session.user = { username: newUser.username };

        // Respond with success
        res.status(201).send({ result: 'success', username, id: newUser._id });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

// Create the route handler
const getUsers = async (req, res) => {
    try {
        // Find all users, excluding sensitive fields like password and salt
        const users = await User.find({}, { password: 0, salt: 0 });
        res.status(200).send(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};
  
// Export routes
module.exports = (app) => {
  app.post('/login', login);
  app.post('/register', register);
  app.get('/users', getUsers);
  app.put('/logout', isLoggedIn, logout);
  app.use(isLoggedIn); 
};

module.exports.isLoggedIn = isLoggedIn; // Export middleware for external use
