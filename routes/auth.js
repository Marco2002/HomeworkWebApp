// ========================
// User Auth Routing
// ========================

// Packages
const express       = require('express');
const passport      = require('passport');
const passwordHash  = require('password-hash');
const fun           = require('../functions');
const mid           = require('../middleware');

// Models
const User   = require('../models/user');
const Class  = require('../models/class');
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
    
    // register User
    User.register(new User({
        username: req.body.username,
    }), req.body.password, (err, user) => {
        // handle error
        if(err) {return fun.error(req, res, err, err.message, '/register')}
        
        passport.authenticate('local')(req, res, () => {
            req.flash('success', `Registered successfully. Welcome ${user.username}`);
            res.redirect('/classes/undefined/homework');
        });
    });

});

// GET select school route
router.get('/selectSchool', mid.isLoggedIn, (req, res) => {
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
    if(errors) {return fun.error(req, res, '', errors[0].msg, '/selectSchool')}
    
    School.findOne({name: req.body.school})
    .then(school => {
        // verify school password
        if(passwordHash.verify(req.body.schoolPassword, school.password)) {
            // right password => update users school
            return User.findByIdAndUpdate({ _id: req.user._id }, { $set: {school_id: school._id}}); // return promise
            
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

            if(err) {return fun.error(req, res, err, 'Error while signing up', '/')}

            res.redirect('/selectClass');
        });
    }, err => {
        // handle error while updating user
        return fun.error(req, res, err, 'Error while adding you to the school', '/selectSchool');
    });
});

// GET select class route
router.get('/selectClass', mid.isLoggedIn, (req, res) => {
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
    // check inputs
    req.checkBody('clas', 'Class field cannot be empty').notEmpty();
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, '', errors[0].msg, '/selectClass')}
    
    User.findByIdAndUpdate({_id: req.user.id}, { $set: {power: 1, class_id: req.body.clas}})
    .then(user => {
        req.login(user, err => {
                // handle possible error
                if(err) {return fun.error(req, res, err, 'Error while signing up', '/')}

                res.redirect(`/classes/${req.body.clas}/homework`);
            });
    }, err => {
        // handle error
        fun.error(req, res, err, 'Error while adding you to the school', '/selectSchool');
    });
});

// Leave Class Route
router.get('/leaveClass', mid.isLoggedIn, mid.isNotLastAdmin, (req, res) => {
    // update user
    User.findByIdAndUpdate({_id: req.user.id}, { $set: {power: 1, class_id: undefined}})
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
        req.login(user, function(err) {
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
router.get('/:user_id', mid.isLoggedIn, mid.isUser, (req, res) => {
    
    // find user
    User.findById({_id: req.params.user_id}).populate('school_id').populate('class_id').exec()
    .then(user => {
        
        // render ejs template
        res.render('auth/show', {
            title: 'TITLE_ACCOUNT_SETTINGS',
            userR: user
        });
    }, err => {
        // handle error while loading user
        fun.error(req, res, err, 'Error in the backend server, please try again later', `/classes/${req.user.class_id}/homework`);
    });

});

module.exports = router;
