const express = require('express');
const { createEvent, getEvents } = require('../controllers/eventController');

const router = express.Router();

// Event Routes
router.post('/', createEvent);
router.get('/', getEvents);

module.exports = router;
