// ======================
// School Routes
// ======================

// packages
const express = require('express');
const passwordHash = require('password-hash');
const fun = require('../functions');
const mid = require('../middleware');

// models
const School = require('../models/school');

const router = express.Router();

// NEW route
router.get('/new', mid.isLoggedIn, mid.isDev, (req, res) => {
    res.render('schools/new');
});

// CREATE route
router.post('/', mid.isLoggedIn, mid.isDev, (req, res) => {
    
    // check inputs
    req.checkBody('school[name]', 'School-name must be between 4-30 characters long').notEmpty().len(4, 30);
    req.checkBody('school[password]', 'Password must be at least 4 characters long').notEmpty().len(4, 100);
    req.checkBody('reenterPassword', 'Passwords do not match, please try again').equals(req.body.school.password);
        
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, '', errors[0].msg, '/schools/new')}
    
    // hash school password
    req.body.school.password = passwordHash.generate(req.body.school.password);
    
    // create school from body
    const school = new School(req.body.school);
    // save school in DB
    school.save(err => {
        // handle possible error
        if(err) { return fun.error(req, res, err, 'Error while adding School', '/schools/new') }
        
        req.flash('success', 'Added School');
        res.redirect('/selectSchool');
    });
});

module.exports = router;