const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 
// Register User
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, avatar } = req.body;

        // Check if the email is the admin email
        const isAdmin = email === process.env.ADMIN_EMAIL;

        // Create a new user instance and save it to the database
        const newUser = new User({
            username,
            email,
            password,
            avatar,
            isAdmin // Set isAdmin flag based on email check
        });

        await newUser.save();  // Saving the user, password is hashed in pre-save middleware
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // Check password validity
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid credentials');
        }

        // Generate token including the admin status
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin  // Use stored admin flag from the database
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Respond with token and user details
        res.json({ token, avatar: user.avatar, isAdmin: user.isAdmin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
