// ======================
// Class Routes
// ======================

// packages
const express = require('express');
const fun = require('../functions');
const mid = require('../middleware');

// models
const Class = require('../models/class');
const Subject = require('../models/subject');
const User = require('../models/user');

const router = express.Router({mergeParams: true});

// New Route
router.get('/new', mid.isLoggedIn, mid.isPartOfSchool, mid.isNotLastAdmin, (req, res) => {

    res.render('classes/new', {
        school_id: req.params.school_id
    });

});

// Create Route
router.post('/', mid.isLoggedIn, mid.isPartOfSchool, mid.isNotLastAdmin, (req, res) => {

    // check inputs    
    req.checkBody('class[name]', 'Classname cannot be empty').notEmpty().len(0, 10);
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, '', errors[0].msg, `/schools/${req.params.school_id}/classes/new`)}
    
    let subjects = req.body.subjects;
    
    // make sure subjects.color is an array
    if(!Array.isArray(subjects.color)) {
        // not array => make array
        subjects.color = [subjects.color];
    }
    
    let _subjects = [];
    
    // loop through subjects and import into class
    for(let i = 0; i < subjects.subject.length; i++) {
        // check if current subject is not empty
        if(subjects.subject[i] != null && subjects.subject[i] != '' 
            && subjects.teacher[i] != null && subjects.teacher[i] != ''
            && subjects.color[i] != null && subjects.color[i] != '') {
            
            // import topic
            _subjects.push({
                subject: subjects.subject[i],
                teacher: subjects.teacher[i],
                color: subjects.color[i]
            });
        }
    }
    
    // check if at least some subjects are listed
    if(_subjects.length == 0) {
        return fun.error(req, res, '', 'Please list the subjects', `/schools/${req.params.school_id}/classes/new`);
    }
    
    req.body.class.subjects = [];
    
    // save all subjects to DB
    for(let s of _subjects) {
        // create subject
        const subject = new Subject(s);
        // save subject to db
        subject.save(err => {
            // handle possible error
            if(err) {return fun.error(req, res, err, 'Error while adding your class', '/selectClass')}
        });
        // push subjects id into classes subject list
        req.body.class.subjects.push(subject._id);
    }
    
    // create class object
    const clas = new Class({
        name: req.body.class.name,
        school_id: req.params.school_id,
        subjects: req.body.class.subjects
    });
    // save class to db
    clas.save(err => {
        // handle possible error
        if(err) {return fun.error(req, res, err, 'Error while adding your class', '/selectClass')}
        
        // make class creator admin 
        User.findByIdAndUpdate({ _id: req.user._id}, { $set: {
            power: 2,
            class_id: clas._id
        }}, {new: true})
        .then(user => {
            req.login(user, (err) => {
                // handle possible error
                if(err) {return fun.error(req, res, err, 'Error while signing up', '/register')}
                
                res.redirect('/selectSubjects');
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
    
    Class.findById({_id: req.params.class_id}).populate({ path: 'subjects', options: { sort: { subject: 1 } } })
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
    req.checkBody('class[name]', 'Classname cannot be langer than 10 characters').notEmpty().len(0, 10);
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
    User.findByIdAndUpdate({_id: req.params.id}, {$set: { power: 2 }}, {new: true})
    .then(user => {
        // success
        req.flash('success', 'Made admin');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    }, err => {
        // handle error
        fun.error(req, res, err, 'Error while making user admin', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
});

// Make member Route
router.get('/:class_id/users/:id/member', mid.isLoggedIn, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {
    // find all admins
    User.find({
        power: 2,
        class_id: req.params.class_id
    }).then(admins => {
        // make sure there are at least 2 admins
        if(!(admins.length == 1 && admins[0]._id == req.params.id)) {
            User.findByIdAndUpdate({_id: req.params.id}, { $set: {power: 1}}, {new: true})
            .then( user => {
                // removed admin
                req.flash('success', 'Made user normal member');
                res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
            }, err => {
                // handle error while updating user
                fun.error(req, res, err, 'Error while making user normal member', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
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
        }, {new: true});
    }).then( user => {
        // success
        req.flash('success', 'Made restricted member');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    }, err => {
        // handle error while making restricted member
        fun.error(req, res, err, 'Error while making restricted member', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
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
            power: 1,
            subjects: []
        }}, {new: true});
    }).then( user => {
        // success
        req.flash('success', 'Kicked user out of class');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    }, err => {
        // handle error while updating user
        fun.error(req, res, err, 'Error while kicking from class', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
});

// CREATE subject
router.post('/:class_id/subjects', mid.isLoggedIn, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {
    // check inputs
    req.checkBody('subject[subject]', 'Subject field cannot be empty').notEmpty().len(1, 20);
    req.checkBody('subject[teacher]', 'Teacher field cannot be empty').notEmpty().len(1, 20);
    req.checkBody('subject[color]', 'Please pick a color').notEmpty().len(1, 15);
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, errors, errors[0].msg, `/schools/${req.params.school_id}/classes/${req.params.class_id}/`)}
    
    // create subject
    Subject.create(req.body.subject)
    .then(subject => {
        // add subject to class' subjects
        return Class.findByIdAndUpdate({ _id: req.params.class_id}, {$push: {subjects: subject._id}});
    }, err => {
        // handle error while saving subject to db
        fun.error(req, res, err, 'Error while saving your subject', `/schools/${req.params.school_id}/classes/${req.params.class_id}/`);
    }).then(clas => {
        // redirect to class settings
        req.flash('success', 'Added subject');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/`);
    }, err => {
        // handle error while updating class
        fun.error(req, res, err, 'Error while saving your subject', `/schools/${req.params.school_id}/classes/${req.params.class_id}/`);
    });
    
});

// UPDATE subject
router.put('/:class_id/subjects/:id', mid.isLoggedIn, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {
    // check inputs
    req.checkBody('subject[subject]', 'Subject field cannot be empty').notEmpty().len(1, 20);
    req.checkBody('subject[teacher]', 'Teacher field cannot be empty').notEmpty().len(1, 20);
    req.checkBody('subject[color]', 'Please pick a color').notEmpty().len(1, 15);
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, errors, errors[0].msg, `/schools/${req.params.school_id}/classes/${req.params.class_id}/`)}
    
    // update subject
    Subject.findByIdAndUpdate({_id: req.params.id}, req.body.subject)
    .then(subject => {
        // flash msg and redirect user
        req.flash('success', 'Updated subject');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/`);
    }, err => {
        // handle error while updating subject
        fun.error(req, res, err, 'Error while updating subject', `/schools/${req.params.school_id}/classes/${req.params.class_id}/`);
    });
    
});

// Destroy subject
router.delete('/:class_id/subjects/:id', mid.isLoggedIn, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    // delete subject from db
    Subject.deleteOne({_id: req.params.id}, err => {
        // handle error while deleting subject
        if(err) return fun.error(req, res, err, 'Error while deleting subject', `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
        
        // flash message and redirect user
        req.flash('success', 'Deleted subject');
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
    
});

module.exports = router;
