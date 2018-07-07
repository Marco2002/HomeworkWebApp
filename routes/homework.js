//======================
// Homework Routes
//======================

// packages
const express      = require('express');
const moment       = require('moment');
const sanitizeHtml = require('sanitize-html');
const mid          = require('../middleware');
const fun          = require('../functions');

// models
const Homework = require('../models/homework');
const Exam = require('../models/exam');
const Class = require('../models/class');

const router  = express.Router({mergeParams: true});

// Index Route
router.get('/', mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, (req, res) => {
    
    // variables
    let _homework, _exams;
    
    // get homework sorted by date
    Homework.find({class_id: req.params.class_id}).sort({date: 1}).exec()
    .then(homework => {
        // format date of all homework
        for(h of homework) {
            h.d = `${h.date.getDate()}.${h.date.getMonth()}`; // useing 'd' becouse 'date' cannot be overwritten
        };
        // store homework in variable
        _homework = homework;
        
        // get exams
        return Exam.find({class_id: req.params.class_id}).sort({date: 1}).exec();
        
    }, err => {
        // handle error while loading homework
        fun.error(req, res, err, 'Error in the backend server, please try again later', `/classes/${req.params.class_id}/homework`);
    }).then(exams => {
        // format date of all exams
        for(e of exams) {
            e.d = `${e.date.getDate()}.${e.date.getMonth()}`;// useing 'd' becouse 'date' cannot be overwritten
        }
        // store exams
        _exams = exams;
        
        // get class and school
        return Class.findById({_id: req.params.class_id}).populate('school_id').exec();
        
    }, err => {
        // handle error while loading exam
        fun.error(req, res, err, 'Error in the backend server, please try again later', `/classes/${req.params.class_id}/homework`);
    }).then(clas => {
        
        // render ejs template with content
        res.render('home', {
            title: 'TITLE_HOMEWORK',
            homework: _homework,
            exams: _exams,
            clas: clas,
            r: _homework[0]
        });
        
    }, err => {
        // handle error while loading class
        fun.error(req, res, err, 'Error in the backend server, please try again later', `/classes/${req.params.class_id}/homework`);
    });
});

// New Route
router.get('/new', mid.isLoggedIn, mid.isPartOfClass, mid.isNotRestricted, (req, res) => {
    // render ejs template
    res.render('homework/new', {
        title: 'TITLE_ADD_HOMEWORK'
    });
});

// Create Route
router.post('/', mid.isLoggedIn, mid.isPartOfClass, mid.isNotRestricted, (req, res) => {
    // check inputs
    req.checkBody('homework[title]', 'Title field cannot be empty').notEmpty().len(1, 40);
    req.checkBody('homework[date]', 'Date field cannot be empty').notEmpty();
    req.checkBody('homework[description]', 'Description field cannot be empty').notEmpty().len(1, 600);
    req.checkBody('homework[subject]', 'Homework subject field cannot be empty').notEmpty().len(1, 20);
    req.checkBody('homework[subjectName]', 'Subject name field cannot be empty').notEmpty().len(1, 20);
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, errors, errors[0].msg, `/classes/${req.params.class_id}/homework/new`)}

    let h = req.body.homework;
    
    // format date to match Date class format
    h.date = moment(h.date, 'DD.MM.YYYY').format('YYYY-MM-DD');
    // sanitize description input and replace 'enter' with <br> for showing in multiple lines
    h.description = sanitizeHtml(String(h.description).replace(/\r/gi, '<br>'), {
        allowedTags: ['br']
    });
    
    // set class id
    h.class_id = req.params.class_id;
    
    // crate homework based on 'h' from body inputs
    Homework.create(h)
    // save homework to DB
    .then( homework => {
        // redirect to homescreen
        req.flash('success', 'Added homework');
        res.redirect(`/classes/${req.params.class_id}/homework`);
    }, err => {
        // handle error while adding homework
        fun.error(req, res, err, 'Error while adding your homework', `/classes/${req.params.class_id}/homework`);
    });
});

// Show Route
router.get('/:id', mid.isLoggedIn, mid.isPartOfClass, (req, res) => {
    // find homework
    Homework.findById({_id: req.params.id})
    .then(homework => {
        // format date
        homework.d = moment(homework.date).format('DD.MM'); // useing 'd' becouse 'date' cannot be overwritten
        // render ejs template
        res.render('homework/show', {
            title: homework.subjectName,
            r: homework
        });
    }, err => {
        // handle error while finding homework
        fun.error(req, res, err, "Couldn't find your homework", `/classes/${req.params.class_id}/homework`);
    });
});

// Destroy Route
router.delete('/:id', mid.isLoggedIn, mid.isPartOfClass, mid.isNotRestricted, (req, res) => {
    // delete homework
    Homework.deleteOne({_id: req.params.id}, err => {
        // handle error while deleting homework
        if(err) return fun.error(req, res, err, 'Error while deleting your homework', `/classes/${req.params.class_id}/homework`);
        
        // flash message and redirect user
        req.flash('success', 'Deleted homework');
        res.redirect(`/classes/${req.params.class_id}/homework`);
    });
});

// Edit Route
router.get('/:id/edit', mid.isLoggedIn, mid.isPartOfClass, mid.isNotRestricted, (req, res) => {
    // find homework
    Homework.findById({_id: req.params.id})
    .then( homework => {
        
        // format date
        homework.d = moment(homework.date).format('DD.MM'); // useing 'd' becouse 'date' cannot be overwritten
        // render ejs template
        res.render('homework/edit', {
            title: 'TITLE_EDIT_HOMEWORK',
            r: homework
        });
        
    }, err => {
        // handle error while finding homework
        fun.error(req, res, err, "Couldn't find your homework", `/classes/${req.params.class_id}/homework`);
    });
});

// Update Route
router.put('/:id', mid.isLoggedIn, mid.isPartOfClass, mid.isNotRestricted, (req, res) => {
    // check body inputs
    req.checkBody('homework[title]', 'Title field cannot be empty').notEmpty().len(1, 40);
    req.checkBody('homework[date]', 'Date field cannot be empty').notEmpty();
    req.checkBody('homework[description]', 'Description field cannot be empty').notEmpty().len(1, 600);
    req.checkBody('homework[subject]', 'Homework subject field cannot be empty').notEmpty().len(1, 20);
    req.checkBody('homework[subjectName]', 'Subject name field cannot be empty').notEmpty().len(1, 20);
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, '', errors[0].msg, `/classes/${req.params.class_id}/homework/${req.params.id}/edit`)}

    let h = req.body.homework;
    
    // format date
    h.date = moment(h.date, 'DD.MM.YYYY').format('YYYY-MM-DD');
    // sanitize description input and replace 'enter' with <br> for showing in multiple lines
    h.description = sanitizeHtml(String(h.description).replace(/\r/gi, '<br>'), {
        allowedTags: ['br']
    });
    
    // update homework
    Homework.findByIdAndUpdate({_id: req.params.id}, h)
    .then( homework => {
        // flash msg and redirect user
        req.flash('success', 'Updated homework');
        res.redirect(`/classes/${req.params.class_id}/homework`);
    }, err => {
        // handle error while updating homework
        fun.error(req, res, err, 'Error while updating your homework', `/classes/${req.params.class_id}/homework`);
    });
});



module.exports = router;
