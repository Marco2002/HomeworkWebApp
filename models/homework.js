// ============
// Homework Schema
// ============

// packages
const mongoose = require('mongoose');

// schema
const homeworkSchema = new mongoose.Schema({
    
    // homework title
    title: {
        type: String,
        // properties
        required: true,
        maxlength: 40
    },
    
    // subject
    subject: {
        type: String,
        // properties
        required: true,
        maxlength: 20
    },
    
    // subject name (user can change the name of a subject)
    subjectName: {
        type: String,
        // properties
        required: true,
        maxlength: 20
    },
    
    // deadline date
    date: {
        type: Date,
        // properties
        required: true
    },

    // description
    description: {
        type: String,
        // properties
        required: true,
        maxlength: 60
    },
    
    // class ref
    class_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class',
        // properties
        required: true,
    },
});

// export
module.exports = mongoose.model('Homework', homeworkSchema);