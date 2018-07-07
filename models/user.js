// ============
// User Schema
// ============

// packages
const mongoose = require('mongoose');

// schema
const userSchema = new mongoose.Schema({
    
    // username
    username: {
        type: String,
        // properties
        required: true,
        index: { unique: true },
        maxlength: 15
    }, 
    
    // password
    password: {
        type: String,
        // properties
        required: false,
    },
    
    // school ref
    school_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School',
    },
    
    // class ref
    class_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class',
    },
    
    // boolean value for isAdmin
    power: {
        type: Number,
        // properties
        required: true,
        default: 1
    }
});

// export
module.exports = mongoose.model('User', userSchema);