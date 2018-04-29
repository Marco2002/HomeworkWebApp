//======================
// /exams routing
//======================

// Packages
const express    = require("express");
const moment     = require("moment");
const mid        = require("../middleware");
const fun        = require("../functions");

const router  = express.Router({mergeParams: true});

// Index Route
router.get("/", mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, (req, res) => {

    const db = require("../db");

    db.query("SELECT *, schools.name AS school_name, classes.name AS class_name, classes.id AS class_id FROM schools JOIN classes ON classes.school_id = schools.id LEFT JOIN homework ON homework.class_id = classes.id WHERE classes.id = ? ORDER BY date", [req.params.class_id], (err, homework, fields) => {

        if(err) {return fun.error(req, res, err, "Error while extracting content from the DB", `/classes/${req.params.class_id}/exams`)}

        db.query("SELECT *, schools.name AS school_name, classes.name AS class_name, classes.id AS class_id FROM schools JOIN classes ON classes.school_id = schools.id LEFT JOIN exams ON exams.class_id = classes.id WHERE classes.id = ? ORDER BY date", [req.params.class_id], (err, exams, fields) => {

            if(err) {return fun.error(req, res, err, "Error while extracting content from the DB", `/classes/${req.params.class_id}/exams`)}

            for(let i = 0; i < homework.length; i++) {
                homework[i].date = moment(homework[i].date).format("DD.MM.YYYY");
            }

            for(let i = 0; i < exams.length; i++) {
                exams[i].date = moment(exams[i].date).format("DD.MM.YYYY");
            }

            res.render("home", {
                title: "TITLE_HOMEWORK",
                homework: homework,
                exams: exams
            });
        });
    });
});

// New Route
router.get("/new", mid.isLoggedIn, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    const db = require("../db");

    db.query("SELECT *, schools.name AS school_name, classes.name AS class_name, classes.id AS class_id FROM schools JOIN classes ON classes.school_id = schools.id WHERE classes.id = ?", [req.params.class_id], (err, exams, fields) => {

        if(err) {return fun.error(req, res, err, "Error while extracting content from the DB", `/classes/${req.params.class_id}/exams`)}

        res.render("exams/new", {
            title: "TITLE_ADD_EXAM",
            e: exams[0],
        });
    });
});

// Create Route
router.post("/", mid.isLoggedIn, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    req.checkBody("exam[title]", "Title field cannot be empty").notEmpty().len(1, 40);
    req.checkBody("exam[date]", "Date field cannot be empty").notEmpty();
    req.checkBody("exam[subject]", "Homework subject field cannot be empty").notEmpty().len(1, 20);
    req.checkBody("exam[subjectName]", "Subject name field cannot be empty").notEmpty().len(1, 20);

    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, "", errors[0].msg, `/classes/${req.params.class_id}/homework/new`)}

    const db = require("../db");

    const e = req.body.exam;
    const topics = req.body.topics;

    const date = moment(e.date, "DD.MM.YYYY").format("YYYY-MM-DD");

    db.query("INSERT INTO exams (class_id, title, subject, subjectName, date) VALUES (?, ?, ?, ?, ?)", [req.params.class_id, e.title, e.subject, e.subjectName, date], (err, results, fields) => {

        if(err) {return fun.error(req, res, err, "Error while adding your exam", `/classes/${req.params.class_id}/exams`)}
        
        if(topics) {
            
            for(let i = 0; i < topics.topic.length; i++) {
    
                if(topics.topic[i] != null && topics.topic[i] != "") {
    
                    db.query("INSERT INTO topics (exam_id, topic, learn) VALUES (?, ?, ?)", [results.insertId, topics.topic[i], topics.learn[i]], (err, results, fields) => {
    
                        if(err) {return fun.error(req, res, err, "Error while adding a topic", `/classes/${req.params.class_id}/exams`)}
                    });
                }
            }
        }

        req.flash("success", "Added exam successfully");
        res.redirect(`/classes/${req.params.class_id}/exams`);
    });
});

// Show Route
router.get("/:id", mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, (req, res) => {

    const db = require("../db");

    db.query("SELECT *, exams.id AS exam_id, schools.name AS school_name, classes.name AS class_name, classes.id AS class_id FROM schools JOIN classes ON classes.school_id = schools.id LEFT JOIN exams ON exams.class_id = classes.id LEFT JOIN topics ON topics.exam_id = exams.id WHERE exams.id = ?", [req.params.id], (err, exams, fields) => {

        if(err || exams.length == 0) {return fun.error(req, res, err, "Couldn't find your exam", `/classes/${req.params.class_id}/exams`)}

        exams[0].date = moment(exams[0].date).format("DD.MM.YYYY");

        res.render("exams/show", {
            title: exams[0].subjectName,
            e: exams[0],
            topics: exams
        });
    });
});

// Destroy Route
router.delete("/:id", mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    const db = require("../db");

    db.query("DELETE FROM exams WHERE id = ?", [req.params.id], (err, results, fields) => {

        if(err) {return fun.error(req, res, err, "Error while deleting your exam", `/classes/${req.params.class_id}/exams`)}

        db.query("DELETE FROM topics WHERE exam_id = ?", [req.params.id], (err, results, fields) => {

            if(err) {return fun.error(req, res, err, "Error while deleting your exam's topics", `/classes/${req.params.class_id}/exams`)}

            req.flash("success", "Deleted exam successfully");
            res.redirect(`/classes/${req.params.class_id}/exams`);
        });
    });
});

// Edit Route
router.get("/:id/edit", mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    const db = require("../db");

    db.query("SELECT *, exams.id AS exam_id, schools.name AS school_name, classes.name AS class_name, classes.id AS class_id FROM schools JOIN classes ON classes.school_id = schools.id LEFT JOIN exams ON exams.class_id = classes.id LEFT JOIN topics ON topics.exam_id = exams.id WHERE exams.id = ?", [req.params.id], (err, exams, fields) => {

        if(err || exams.length == 0) {return fun.error(req, res, err, "Couldn't find your exam", `/classes/${req.params.class_id}/exams`)}

        exams[0].date = moment(exams[0].date).format("DD.MM.YYYY");

        res.render("exams/edit", {
            title: "TITLE_EDIT_EXAM",
            e: exams[0],
            topics: exams
        });
    });
});

// Update Route
router.put("/:id", mid.isLoggedIn, mid.updateUser, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    req.checkBody("exam[title]", "Title field cannot be empty").notEmpty().len(1, 40);
    req.checkBody("exam[date]", "Date field cannot be empty").notEmpty();
    req.checkBody("exam[subject]", "Homework subject field cannot be empty").notEmpty().len(1, 20);
    req.checkBody("exam[subjectName]", "Subject name field cannot be empty").notEmpty().len(1, 20);

    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, "", errors[0].msg, `/classes/${req.params.class_id}/exams/${req.params.id}/edit`)}

    const db = require("../db");
    const e = req.body.exam;
    const topics = req.body.topics;

    const date = moment(e.date, "DD.MM.YYYY").format("YYYY-MM-DD");

    db.query("UPDATE exams SET title = ?, subject = ?, subjectName = ?, date = ? WHERE exams.id = ?", [e.title, e.subject, e.subjectName, date, req.params.id], (err, results, fields) => {

        if(err) {return fun.error(req, res, err, "Error while updating your exam", `/classes/${req.params.class_id}/exams`)}

        db.query("DELETE FROM topics WHERE exam_id = ?", [req.params.id], (err, results, fields) => {

            if(err) {return fun.error(req, res, err, "Error while updating your exam", `/classes/${req.params.class_id}/exams`)}
    
            if(topics) {
                
                for(let i = 0; i < topics.topic.length; i++) {
    
                    if(topics.topic[i] != null && topics.topic[i] != "") {
    
                        db.query("INSERT INTO topics (exam_id, topic, learn) VALUES (?, ?, ?)", [req.params.id, topics.topic[i], topics.learn[i]], (err, results, fields) => {
    
                            if(err) {return fun.error(req, res, err, "Error while adding a topic", `/classes/${req.params.class_id}/exams`)}
                        });
                    }
                }
            
            }
            
            req.flash("success", "Updated exam successfully");
            res.redirect(`/classes/${req.params.class_id}/homework`);
        });
    });
});

module.exports = router;
