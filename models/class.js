// ============
// Class Schema
// ============

// packages
const mongoose = require('mongoose');

// subject schema
const subjectSchema = require('./subject');

// schema
const classSchema = new mongoose.Schema({
    // classname
    name: {
        type: String,
        // properties
        required: true,
        trim: true,
        maxlength: 10
    },
    
    subjects: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject',
    }],
    
    // school ref
    school_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School',
        // properties
        required: true,
    }
});

// export
module.exports = mongoose.model('Class', classSchema);