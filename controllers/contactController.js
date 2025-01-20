const Contact = require('../models/Contact');

// Contact Form submission
exports.submitContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(200).json({ message: "Message sent successfully" });
    } catch (err) {
        console.error("Error saving contact message:", err);
        res.status(500).json({ message: "Error saving contact message" });
    }
};
