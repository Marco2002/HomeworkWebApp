// ============
// Class Schema
// ============

// packages
const mongoose = require('mongoose');

// schema
const classSchema = new mongoose.Schema({
    
    // classname
    name: {
        type: String,
        // properties
        required: true,
        maxlength: 10
    },
    
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