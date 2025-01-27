require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('./models/User'); // Import User model
const Event = require('./models/Event'); // Import Event model
const Contact = require('./models/Contact'); // Import Contact model
const Registration = require('./models/Registration'); // Import Registration model

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: 'https://madhurmkr.netlify.app' }));

// MongoDB URI for the "virtual-event" database
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://Madhumita:rmkrmadhu@cluster0.mongodb.net/virtual-event?retryWrites=true&w=majority';

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB (virtual-event)');
    } catch (error) {
        console.error('Error connecting to MongoDB (virtual-event):', error);
        process.exit(1);
    }
};

// Call the MongoDB connection
connectDB();

// Route to handle contact form submissions
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Save contact form submission
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ message: 'Contact form submitted successfully' });
    } catch (error) {
        console.error('Error submitting contact form:', error.message);
        res.status(500).json({ message: 'Error submitting contact form' });
    }
});

// Route: Get all Contact form submissions (Admin only)
app.get('/api/admin/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contact form submissions:', error.message);
        res.status(500).json({ message: 'Error fetching contact form submissions' });
    }
});

// User Registration Route
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, event } = req.body;

        // Validate request body
        if (!name || !email || !password || !event) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Save new user with plain text password
        const newUser = new User({ name, email, password, event });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// User Login Route
// User Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate request body
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`User found: ${user.email}, password: ${user.password}`);
        
        // Compare the entered password with the stored plain text password
        if (password !== user.password) {
            console.log('Entered password does not match stored password');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error logging in:', error); // Log the error details
        res.status(500).json({ message: 'Error logging in' });
    }
});


// Event Creation Route (Admin only)
app.post('/api/admin/events', async (req, res) => {
    try {
        const { name, description, date, location } = req.body;

        // Validate input
        if (!name || !description || !date || !location) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Save event to the database
        const newEvent = new Event({ name, description, date, location });
        await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event' });
    }
});

// Get all events (Public Route)
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events); // Send the events in the response
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Admin Routes

// Get all events for admin
app.get('/api/admin/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Get all registrations for admin
app.get('/api/admin/register', async (req, res) => {
    try {
        console.log('Fetching registrations...');
        const registrations = await Registration.find();
        res.status(200).json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: 'Error fetching registrations' });
    }
});

// Delete an event (Admin only)
app.delete('/api/admin/events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete event
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
