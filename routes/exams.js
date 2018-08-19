//======================
// Exam Routes
//======================

// Packages
const express = require('express');
const moment = require('moment');
const mid = require('../middleware');
const fun = require('../functions');

// models
const Homework = require('../models/homework');
const Exam = require('../models/exam');
const Class = require('../models/class');

const router = express.Router({mergeParams: true});

// Index Route
router.get('/', mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, mid.hasSelectedSubjects, (req, res) => {
    
    // variables
    let _homework = [];
    let _exams = [];
    
    // get homework sorted by date
    Homework.find({class_id: req.params.class_id}).populate('subject').sort({date: 1}).exec()
    .then(homework => {
        // check if user has homework subject
        for(let h of homework) {
            for(let s of req.user.subjects) {
                if(s._id.equals(h.subject._id)) {
                    // user has subject => format date and push into final homework
                    h.d = `${h.date.getDate()}.${h.date.getMonth()}`; // useing 'd' becouse 'date' cannot be overwritten
                    _homework.push(h);
                    break;
                }
            }
        }
        
        // get exams
        return Exam.find({class_id: req.params.class_id}).populate('subject').sort({date: 1}).exec();
        
    }, err => {
        // handle error while loading homework
        fun.error(req, res, err, 'Error in the backend server, please try again later', `/classes/${req.params.class_id}/homework`);
    }).then(exams => {
        // check if user has exams subject
        for(let e of exams) {
            for(let s of req.user.subjects) {
                if(s._id.equals(e.subject._id)) {
                    // user has subject => format date and push into final exams
                    e.d = `${e.date.getDate()}.${e.date.getMonth()}`; // useing 'd' becouse 'date' cannot be overwritten
                    _exams.push(e);
                    break;
                }
            }
        }
        
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
    // renter ejs template
    res.render('exams/new', {
        title: 'TITLE_ADD_EXAM',
    });
});

// Create Route
router.post('/', mid.isLoggedIn, mid.isPartOfClass, mid.isNotRestricted, (req, res) => {
    // check inputs
    req.checkBody('exam[title]', 'Title field cannot be empty').notEmpty().len(1, 40);
    req.checkBody('exam[date]', 'Date field cannot be empty').notEmpty();
    req.checkBody('exam[subject]', 'Homework subject field cannot be empty').notEmpty();
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, '', errors[0].msg, `/classes/${req.params.class_id}/exams/new`)}

    let e = req.body.exam;
    
    // format date to match Date class format
    e.date = moment(e.date, 'DD.MM.YYYY').format('YYYY-MM-DD');
    
    // set class id
    e.class_id = req.params.class_id;
    
    let topics = req.body.topics;
    
    if(topics) {
        // make sure topics.topic is an array
        if(!Array.isArray(topics.topic)) {
            // not array => make array
            topics.topic = [topics.topic];
        }
        // make sure topics.learn is an array
        if(!Array.isArray(topics.learn)) {
            // not array => make array
            topics.learn = [topics.learn];
        }
        
        e.topics = [];
    
        // loop through topics and import into exam
        for(let i = 0; i < topics.topic.length; i++) {
            // check if current index topic is not empty
            if(topics.topic[i] != null && topics.topic[i] !== '') {
                
                // import topic
                e.topics.push({
                    topic: topics.topic[i],
                    learn: topics.learn[i]
                });
            }
        }
    }
    
    // create exam based on 'e' from body inputs
    Exam.create(e)
    // save exam to DB
    .then(exam => {
        // flash success msg and redirect user
        req.flash('success', 'Added exam');
        res.redirect(`/classes/${req.params.class_id}/exams`);
    }, err => {
        // handle error while adding exam
        fun.error(req, res, err, 'Error while adding your exam', `/classes/${req.params.class_id}/exams`);
    });
});

// Show Route
router.get('/:id', mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, (req, res) => {
    // find exam
    Exam.findById({_id: req.params.id}).populate('subject')
    .then(exam => {
        // format date
        exam.d = moment(exam.date).format('DD.MM'); // useing 'd' becouse 'date' cannot be overwritten
        // render ejs template
        res.render('exams/show', {
            title: exam.subject.subject,
            r: exam
        });
    }, err => {
        // handle error while finding exam
        fun.error(req, res, err, "Couldn't find your exam", `/classes/${req.params.class_id}/exams`);
    });
});

// Destroy Route
router.delete('/:id', mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, mid.isNotRestricted, (req, res) => {
    // delete homework
    Exam.deleteOne({_id: req.params.id}, err => {
        // handle error while deleting exam
        if(err) return fun.error(req, res, err, 'Error while deleting your exam', `/classes/${req.params.class_id}/exams`);
        
        // flash message and redirect user
        req.flash('success', 'Deleted exam');
        res.redirect(`/classes/${req.params.class_id}/exams`);
    });
});

// Edit Route
router.get('/:id/edit', mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, mid.isNotRestricted, (req, res) => {
    // find exam
    Exam.findById({_id: req.params.id}).populate('subject')
    .then(exam => {
        // format date
        exam.d = moment(exam.date).format('DD.MM'); // useing 'd' becouse 'date' cannot be overwritten
        // render ejs template
        res.render('exams/edit', {
            title: 'TITLE_EDIT_EXAM',
            r: exam
        });
    }, err => {
        // handle error while finding exam
        fun.error(req, res, err, "Couldn't find your exam", `/classes/${req.params.class_id}/exams`);
    });
});

// Update Route
router.put('/:id', mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, mid.isNotRestricted, (req, res) => {
    // check body inputs
    req.checkBody('exam[title]', 'Title field cannot be empty').notEmpty().len(1, 40);
    req.checkBody('exam[date]', 'Date field cannot be empty').notEmpty();
    req.checkBody('exam[subject]', 'Homework subject field cannot be empty').notEmpty();
    // handle input errors
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, '', errors[0].msg, `/classes/${req.params.class_id}/exams/${req.params.id}/edit`)}
    
    let e = req.body.exam;
    let topics = req.body.topics;
    
    if(topics) {
        // make sure topics.topic is an array
        if(!Array.isArray(topics.topic)) {
            // not array => make array
            topics.topic = [topics.topic];
        }
        // make sure topics.learn is an array
        if(!Array.isArray(topics.learn)) {
            // not array => make array
            topics.learn = [topics.learn];
        }
        e.topics = [];
    
        // loop through topics and import into exam
        for(let i = 0; i < topics.topic.length; i++) {
            // check if current index topic is not empty
            if(topics.topic[i] != null && topics.topic[i] != '') {
                
                // import topic
                e.topics.push({
                    topic: topics.topic[i],
                    learn: topics.learn[i]
                });
            }
        }
    }
    
    // format date to match Date class format
    e.date = moment(e.date, 'DD.MM.YYYY').format('YYYY-MM-DD');
    
    // update exam
    Exam.findByIdAndUpdate({_id: req.params.id}, e)
    .then( exam => {
        // flash msg and redirect user
        req.flash('success', 'Updated exam');
        res.redirect(`/classes/${req.params.class_id}/homework`);
    }, err => {
        // handle error while updating exam
        fun.error(req, res, err, 'Error while updating your exam', `/classes/${req.params.class_id}/exams`);
    });
});

module.exports = router;
