const bcrypt = require('bcryptjs');
const User = require('../models/User');

// User Registration
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, event } = req.body;
        if (!name || !email || !password || !event) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, event });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error registering user." });
    }
};

// User Login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({ message: "Login successful", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error logging in" });
    }
};
