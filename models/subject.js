// ============
// Subject Schema
// ============

// packages
const mongoose = require('mongoose');

// schema
const subjectSchema = new mongoose.Schema({
    // subject
    subject: {
        type: String,
        // properties
        required: true,
        maxlength: 20
    },
    
    // subject color
    color: {
        type: String,
        // properties
        required: true,
        maxlength: 15
    },
    
    // subject teacher
    teacher: {
        type: String,
        // properties
        trim: true,
        required: true,
        maxlength: 20
    }
});

// export
module.exports = mongoose.model('Subject', subjectSchema);