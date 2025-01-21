require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('./models/User'); // Import User model
const Event = require('./models/Event'); // Import Event model
const Contact = require('./models/Contact'); // Import Contact model
const Registration = require('./models/Registration'); // Import Registration model
// const mongoURI = process.env.MONGODB_URI;

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB URI for the primary database
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-event';

// MongoDB URI for the secondary database (contact-form)
const contactFormURI = process.env.MONGODB_CONTACT_URI || 'mongodb://localhost:27017/contact-form';

// Function to connect to the main MongoDB database
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Create a connection for the secondary MongoDB database
const contactDb = mongoose.createConnection(contactFormURI);

contactDb.on('connected', () => console.log('Connected to contact-form MongoDB'));
contactDb.on('error', (error) => {
    console.error('Error connecting to contact-form MongoDB:', error);
    process.exit(1);
});

// Call the main MongoDB connection
connectDB();


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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = new User({ name, email, password: hashedPassword, event });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

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
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error logging in:', error);
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
app.get('/api/admin/registrations', async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.status(200).json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: 'Error fetching registrations' });
    }
});

// Update an existing event (Admin only)
app.put('/api/admin/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, date, location } = req.body;

        // Validate input
        if (!name || !description || !date || !location) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Update event
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { name, description, date, location },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event' });
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

// Get registrations for a specific event (Admin only)
app.get('/api/admin/event-registrations/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const registrations = await Registration.find({ event: eventId });
        res.status(200).json(registrations);
    } catch (error) {
        console.error('Error fetching event registrations:', error);
        res.status(500).json({ message: 'Error fetching event registrations' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
