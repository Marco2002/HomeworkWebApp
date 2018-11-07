// ========================
// User Auth Routing
// ========================

// Packages
const express = require('express');
const passport = require('passport');
const passwordHash = require('password-hash');
const fun = require('../functions');
const mid = require('../middleware');

// Models
const User = require('../models/user');
const Class = require('../models/class');
const School = require('../models/school');

const router = express.Router();

// GET register route
router.get('/register', mid.isNotLoggedIn, (req, res) => {
    res.render('auth/register');
});


// POST register route
router.post('/register', mid.isNotLoggedIn, (req, res) => {

    // check if inputs are correct
    req.checkBody('username', 'Username must be at least 4 characters long').notEmpty().len(4, 15);
    req.checkBody('password', 'Password must be at least 8 characters long').notEmpty().len(8, 100);
    req.checkBody('reenterPassword', 'Passwords do not match, please try again').equals(req.body.password);
    
    // handle input errors    
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, '', errors[0].msg, '/register')}
    
    // hash school password
    req.body.password = passwordHash.generate(req.body.password);

    const {username, password} = req.body;

    // create User
    let user = new User({
        username,
        password
    });
    // store user in DB
    user.save(err => {
        // handle error while storing user
        if(err) return fun.error(req, res, err, 'Username already taken', '/register');
        // authenticate user
        req.login(user, err => {

            if(err) return fun.error(req, res, err, "Error while logging in", "/login");

            req.flash('success', `Registered successfully. Welcome ${user.username}`);
            res.redirect('/selectSchool');
        });
    });
});

// GET select school route
router.get('/selectSchool', mid.isLoggedIn, mid.isNotLastAdmin, (req, res) => {
    School.find({})
    .then(schools => {
        res.render('auth/selectSchool', {
            results: schools,
        });
    }, err => {
        // handle error
        return fun.error(req, res, err, 'Error while loading schools');
    });
});

// POST select school route
router.post('/selectSchool', mid.isLoggedIn, mid.isNotLastAdmin, (req, res) => {
    // check if inputs are correct
    req.checkBody('school', 'School field cannot be empty').notEmpty();
    req.checkBody('schoolPassword', 'Password must be at least 4 characters long').notEmpty().len(4, 100);
    // handle input errors
    const errors = req.validationErrors();
    if(errors) fun.error(req, res, '', errors[0].msg, '/selectSchool');
    
    School.findOne({name: req.body.school})
    .then(school => {
        // verify school password
        if(passwordHash.verify(req.body.schoolPassword, school.password)) {
            // right password => update users school
            return User.findByIdAndUpdate({ _id: req.user._id }, { $set: {school_id: school._id, class_id: undefined, subjects: []}}, {new: true}); // return promise
        } else {
            // wrong password
            return fun.error(req, res, '', 'Wrong school password', '/selectSchool');
        }
    }, err => {
        // handle error while finding school
        fun.error(req, res, err, "Couldn't find your school", '/selectSchool');
    }).then(user => {
        // login updated user
        req.login(user, err => {

            if(err) return fun.error(req, res, err, 'Error while signing in', '/');

            res.redirect('/selectClass');
        });
    }, err => {
        // handle error while updating user
        return fun.error(req, res, err, 'Error while adding you to the school', '/selectSchool');
    });
});

// GET select class route
router.get('/selectClass', mid.isLoggedIn, mid.isNotLastAdmin, (req, res) => {
    // make sure user is in a school
    if(req.user.school_id != undefined) {
        // find all classes in school
        Class.find({school_id: req.user.school_id})
        .then(classes => {
            res.render('auth/selectClass', {
                results: classes
            });
        }, err => {
            // handle error
            fun.error(req, res, err, 'Error while loading classes', '/');
        });
    } else {
        // user is in no school => select school
        res.redirect('/selectSchool');
    }
});

// POST select class route
router.post('/selectClass', mid.updateUser, mid.isLoggedIn, mid.isNotLastAdmin, (req, res) => {
    
    // make sure user is in a school
    if(req.user.school_id != undefined) {
        // check inputs
        req.checkBody('clas', 'Class field cannot be empty').notEmpty();
        // handle input errors
        const errors = req.validationErrors();
        if(errors) {return fun.error(req, res, '', errors[0].msg, '/selectClass')}
        
        User.findByIdAndUpdate({_id: req.user._id}, { $set: {power: 1, class_id: req.body.clas, subjects: []}}, {new: true})
        .then(user => {
            req.login(user, err => {
                // handle possible error
                if(err) {return fun.error(req, res, err, 'Error while signing in', '/')}
    
                res.redirect(`/selectSubjects`);
            });
        }, err => {
            // handle error
            fun.error(req, res, err, 'Error while adding you to the school', '/selectSchool');
        });
    } else {
        // user is in no school => select school
        res.redirect('/selectSchool');
    }
});

// GET select subjects route
router.get('/selectSubjects', mid.updateUser, mid.isLoggedIn, (req, res) => {
    // make sure user is in a class
    if(req.user.class_id != undefined) {
        // find users class
        Class.findById(req.user.class_id).populate({ path: 'subjects', options: { sort: { subject: 1 } } })
        .then(clas => {
            // render ejs templante with classes subjects
            res.render('auth/selectSubjects', {
                r: clas
            });
        }, err => {
            // handle error
            fun.error(req, res, err, 'Error while loading your class', '/');
        });
    } else {
        // user is in no class => select class
        res.redirect('/selectClass');
    }
});

// POST select subjects route
router.post('/selectSubjects', mid.updateUser, mid.isLoggedIn, (req, res) => {
    // make sure user is in a class
    if(req.user.class_id != undefined) {
        // check inputs
        req.checkBody('subjects', 'Please select your subjects').notEmpty();
        // handle input errors
        const errors = req.validationErrors();
        if(errors) {return fun.error(req, res, '', errors[0].msg, '/selectSubjects')}
        
        User.findByIdAndUpdate(req.user._id, { $set: {subjects: req.body.subjects}}, {new: true})
        .then(user => {
            // login updated user and redirect to homepage
            req.login(user, err => {
                // handle possible error
                if(err) {return fun.error(req, res, err, 'Error while signing in', '/')}
                res.redirect(`/classes/${req.user.class_id}/homework`);
            });
        }, err => {
            // handle error
            fun.error(req, res, err, 'Error while setting your subjects', '/');
        });
    } else {
        // user is in no class => select class
        res.redirect('/selectClass');
    }
});

// Leave Class Route
router.get('/leaveClass', mid.isLoggedIn, mid.isNotLastAdmin, (req, res) => {
    // update user
    User.findByIdAndUpdate({_id: req.user._id}, { $set: {power: 1, class_id: undefined, subjects: []}}, {new: true})
    .then(user => {
        // redirect to select class
        res.redirect('/selectClass');
    }, err => {
        // handle error while updating user
        fun.error(req, res, err, 'Error while leaving class', `/classes/${req.user.class_id}/homework`);
    });
});


// GET login route
router.get('/login', mid.isNotLoggedIn, (req, res) => {
    res.render('auth/login');
});

// POST login route
router.post('/login', mid.isNotLoggedIn, (req, res) => {

    // check if inputs are correct
    req.checkBody('username', 'Username must be at least 4 characters long').notEmpty().len(4, 15);
    req.checkBody('password', 'Password must be at least 8 characters long').notEmpty().len(8, 100);

    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, '', errors[0].msg, '/login')}

    // authenticate
    passport.authenticate('local', (err, user) => {
        // handle possible error
        if (err) {return fun.error(req, res, err, 'Error while logging in', '/login')}

        // Redirect if it fails
        if (!user) {return fun.error(req, res, '', 'Wrong password or username', '/login')}

        // login user
        req.login(user, (err) => {
            // handle possible error
            if (err) {return fun.error(req, res, err, 'Error while logging in', '/login')}

            // Redirect if it succeeds
            req.flash('success', `Welcome back ${user.username}`);
            res.redirect(`/classes/${user.class_id}/homework`);

        });
    })(req, res);
});

// logout route
router.get('/logout', mid.isLoggedIn, (req, res) => {
    req.logout(); // logout user
    req.session.destroy(); // destroy session
    res.redirect('/'); // redirect to landingpage
});

// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', {scope: ['profile']}));

// callback route
router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/'
}));

// GET user route
router.get('/accountSettings', mid.isLoggedIn, (req, res) => {
    
    if(req.user.class_id != undefined) {
        // find user
        User.findById({_id: req.user._id}).populate('school_id').populate('class_id').populate('subjects').exec()
        .then(user => {
            
            // render ejs template
            res.render('auth/show', {
                title: 'TITLE_SETTINGS',
                userR: user
            });
        }, err => {
            // handle error while loading user
            fun.error(req, res, err, 'Error in the backend server, please try again later', `/classes/${req.user.class_id}/homework`);
        });
    } else {
        // user is in no class => no settings
        res.redirect('/selectClass');
    }

});

module.exports = router;
