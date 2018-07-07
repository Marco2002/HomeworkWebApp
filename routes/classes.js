// ======================
// Class Routes
// ======================

// packages
const express = require('express');
const fun = require('../functions');
const mid = require('../middleware');

// models
const Class = require('../models/class');
const User = require('../models/user');

const router = express.Router({mergeParams: true});

// New Route
router.get('/new', mid.isLoggedIn, mid.isPartOfSchool, (req, res) => {

    res.render('classes/new', {
        school_id: req.params.school_id
    });

});

// Create Route
router.post('/', mid.isLoggedIn, mid.isPartOfSchool, mid.isNotLastAdmin, (req, res) => {
    
    // check inputs    
    req.checkBody('class[name]', 'Class-name cannot be langer than 10 characters').notEmpty().len(0, 10);
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, '', errors[0].msg, `/schools/${req.params.school_id}/classes/new`)}
    
    // create class object
    const clas = new Class({
        name: req.body.class.name,
        school_id: req.params.school_id
    });
    // save class to db
    clas.save(err => {
        // handle possible error
        if(err) {return fun.error(req, res, err, 'Error while adding your class', '/selectClass')}
        
        // make class creator admin 
        User.findByIdAndUpdate({ _id: req.user._id}, { $set: {
            power: 2,
            class_id: clas._id
        }}).then(user => {
            req.login(user, (err) => {
                // handle possible error
                if(err) {return fun.error(req, res, err, 'Error while signing up', '/register')}
                
                res.redirect(`/classes/${clas._id}/homework`);
            });
        }, err => {
            // handle error
            fun.error(req, res, err, 'Error while making you class admin', '/selectClass');
        });
    });
});

// Show Route
router.get('/:class_id', mid.isLoggedIn, mid.updateUser, mid.isPartOfSchool, mid.isPartOfClass, (req, res) => {
    
    // variables
    let clas;
    
    Class.findById({_id: req.params.class_id})
    .then(c => {
        
        // save clas
        clas = c;
        // find all users in class
        return User.find({class_id: req.params.class_id});
        
    }, err => {
        // handle error  while loading class
        fun.error(req, res, err, 'Error while loading class', `/classes/${req.user.class_id}/homework`);
    }).then(users => {
        // render ejs template
        res.render('classes/show', {
            title: 'TITLE_CLASS_SETTINGS',
            clas: clas,
            users: users
        });
        
    }, err => {
        // handle error while loading users
        fun.error(req, res, err, 'Error while loading class', `/classes/${req.user.class_id}/homework`);
    });
});

// Update Route
router.put('/:class_id', mid.isLoggedIn, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {
    
    // check inputs
    req.checkBody('class[name]', 'Class-name cannot be langer than 10 characters').notEmpty().len(0, 10);
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, '', errors[0].msg, `/schools/${req.params.school_id}/classes/${req.params.class_id}/edit`)}
    
    Class.findByIdAndUpdate({ _id: req.params.class_id}, {$set: {name: req.body.class.name}})
    .then(clas => {
        // redirect back
        req.flash('success', 'Updated class');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    }, err => {
        // handle error
        fun.error(req, res, err, 'Error while updating class', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
});

// Make Admin Route
router.get('/:class_id/users/:id/admin', mid.isLoggedIn, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {
    
    // set power of user to 2
    User.findByIdAndUpdate({_id: req.params.id}, {$set: { power: 2 }})
    .then(user => {
        // success
        req.flash('success', 'Made admin');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    }, err => {
        // handle error
        fun.error(req, res, err, 'Error while making user admin', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
});

// Romove Admin Route
router.get('/:class_id/users/:id/deadmin', mid.isLoggedIn, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {
    // find all admins
    User.find({
        power: 2,
        class_id: req.params.class_id
    }).then(admins => {
        // make sure there are at least 2 admins
        if(admins.length > 1) {
            User.findByIdAndUpdate({_id: req.params.id}, { $set: {power: 1}})
            .then( user => {
                // removed admin
                req.flash('success', 'Removed admin');
                res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
            }, err => {
                // handle error while updating user
                fun.error(req, res, err, 'Error while removing user from admins', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
            });
        } else {
            // only 1 admin => cannot remove last admin
            fun.error(req, res, '', 'You cannot remove the last admin', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
        }
    }, err => {
        // handle err
        fun.error(req, res, err, 'Error while removing user from admins', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
});

// Make restricted member
router.get('/:class_id/users/:id/restrict', mid.isLoggedIn, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {
    // get all admins
    User.find({
        power: 2,
        class_id: req.params.class_id
    }).then( admins => {
        // check if user is last admin
        if(admins.length == 1 && admins[0]._id == req.params.id) {
            // user is last admin => error
            return fun.error(req, res, '', 'You cannot remove the last admin', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
        }
        // make restricted member
        return User.findByIdAndUpdate({_id: req.params.id}, {$set: {
            power: 0}
        });
    }).then( user => {
        // success
        req.flash('success', 'Made restricted member');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    }, err => {
        // handle error while making restricted member
        fun.error(req, res, err, 'Error while making restricted member', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
});

// Remove restricted member
router.get('/:class_id/users/:id/derestrict', mid.isLoggedIn, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {
    
    // set power of user back to 1
    User.findByIdAndUpdate({_id: req.params.id}, {$set: { power: 1 }})
    .then(user => {
        // success
        req.flash('success', 'Removed restricted member');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    }, err => {
        // handle error
        fun.error(req, res, err, 'Error while removing restricted member', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
});

// Kick route
router.get('/:class_id/users/:id/kick', mid.isLoggedIn, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {
    // get all admins
    User.find({
        power: 2,
        class_id: req.params.class_id
    }).then( admins => {
        // check if user is last admin
        if(admins.length == 1 && admins[0]._id == req.params.id) {
            // user is last admin => error
            return fun.error(req, res, '', 'You cannot remove the last admin', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
        }
        // remove user from class
        return User.findByIdAndUpdate({_id: req.params.id}, {$set: {
            class_id: undefined,
            power: 1}
        });
    }).then( user => {
        // success
        req.flash('success', 'Kicked user out of class');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    }, err => {
        // handle error while updating user
        fun.error(req, res, err, 'Error while kicking from class', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
});

module.exports = router;
