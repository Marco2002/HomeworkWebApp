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
        required: false,
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
    },
    
    // google oauth
    // google username (can doesn't have to be unique)
    google_username: {
        type: String,
        // properties
        required: false
    },
    
    // unique id
    google_id: {
        type: String,
        // properties
        required: false
    },
    
    // token
    google_token: {
        type: String,
        // properties
        required: false
    },
    
    // profile img
    google_image: {
        type: String,
        // properties
        required: false
    }
});

// export
module.exports = mongoose.model('User', userSchema);