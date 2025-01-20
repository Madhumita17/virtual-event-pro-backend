const express = require('express');
const { submitContact } = require('../controllers/contactController');

const router = express.Router();

// Contact Form Route
router.post('/', submitContact);

module.exports = router;
