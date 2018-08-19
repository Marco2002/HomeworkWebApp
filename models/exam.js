// ============
// Exam Schema
// ============

// packages
const mongoose = require('mongoose');

// schema
const examSchema = new mongoose.Schema({
    
    // exam title
    title: {
        type: String,
        // properties
        required: true,
        maxlength: 40
    },
    
    // subject
    subject: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject'
    },
    
    // exam date
    date: {
        type: Date,
        // properties
        required: true
    },
    
    // exam topics
    topics: [{
        
        // topic itself
        topic: {
            type: String,
            // properties
            required: true,
            maxlength: 30
        },
        
        // where to learn
        learn: {
            type: String,
            // properties
            default: null,
            maxlength: 20
        }
    }],
    
    // class ref
    class_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class',
        // properties
        required: true,
    },
});

// export
module.exports = mongoose.model('Exam', examSchema);