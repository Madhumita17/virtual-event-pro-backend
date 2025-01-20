const Event = require('../models/Event');

// Create an Event
exports.createEvent = async (req, res) => {
    try {
        const { name, description, date, location } = req.body;
        const newEvent = new Event({ name, description, date, location });
        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating event." });
    }
};

// Get all Events
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching events" });
    }
};
