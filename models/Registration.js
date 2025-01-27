const mongoose = require('mongoose');

// Registration Schema
const registrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password:{type:String,required:true},
    event: { type: String, required: true },
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
