// ============
// School Schema
// ============

// packages
const mongoose = require('mongoose');

// schema
const schoolSchema = new mongoose.Schema({
    
    // schoolname
    name: {
        type: String,
        // properties
        required: true,
        index: { unique: true },
        maxlength: 30
    },
    
    // hashed password
    password: {
        type: String,
        // properties
        required: true,
    }
});

// export
module.exports = mongoose.model('School', schoolSchema);