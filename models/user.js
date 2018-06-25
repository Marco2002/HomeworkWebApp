// ============
// User Schema
// ============

// packages
const mongoose              = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

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
    is_admin: {
        type: Boolean,
        // properties
        required: true,
        default: false
    }
});

// plugin passport-local-mongoose methods for passport session
userSchema.plugin(passportLocalMongoose);

// export
module.exports = mongoose.model('User', userSchema);