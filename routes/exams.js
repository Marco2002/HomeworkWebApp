//======================
// /exams routing
//======================

// Packages
const express  = require("express"),
    middleware = require("../middleware"),

// Models
    Class  = require("../models/class"),
    School = require("../models/school");
    
const router  = express.Router({mergeParams: true});

// Index Route
router.get("/", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect("/");
        }
        School.findById(req.params.school_id, (err2, school) => {
            if(err2) {
                console.log(err2);
                return res.redirect("/");
            }
            res.render("home", {
                title: "Homework",
                clas: clas,
                school: school,
            });
        });
    });
});

// New Route
router.get("/new", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        }
        School.findById(req.params.school_id, (err2, school) => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
            }
            res.render("exams/new", {
                title: "Add Exam",
                clas: clas,
                school: school,
            });
        });
    });
});

// Create Route
router.post("/", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        }
        
        let exam = req.body.exam;
        exam.topics = [];
        const topics = req.body.topics;
        
        for(let i = 0; i < topics.topic.length; i++) {
            const topic = {
                topic: topics.topic[i],
                learn: topics.learn[i]
            };
            exam.topics.push(topic);
        }
        
        clas.exams.push(exam);
        clas.save(err2 => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
            }
            res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        });
    });
});

// Show Route
router.get("/:id", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        }
        
        School.findById(req.params.school_id, (err2, school) => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
            }
            
            if(clas.exams.id(req.params.id)) {
                res.render("exams/show", {
                    title: clas.exams.id(req.params.id).title,
                    clas: clas,
                    school: school,
                    e: clas.exams.id(req.params.id)
                });
            } else {
                console.log("no exam with the given ID existst");
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
            }
        });
        
    });
});

// Destroy Route
router.delete("/:id", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        }
        
        if(clas.exams.id(req.params.id)) {
            clas.exams.id(req.params.id).remove();
        } else {
            console.log("no exam with the given ID existst");
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        }
        
        clas.save(err2 => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
            }
            res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        });
        
    });
});

// Edit Route
router.get("/:id/edit", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        }
        School.findById(req.params.school_id, (err2, school) => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
            }
            
            if(clas.exams.id(req.params.id)) {
                res.render("exams/edit", {
                    title: "Edit Exam",
                    clas: clas,
                    school: school,
                    e: clas.exams.id(req.params.id)
                });
            } else {
                console.log("no exam with the given ID existst");
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
            }
            
        });
        
    });
});

// Update Route
router.put("/:id", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        }
        
        if(clas.exams.id(req.params.id)) {
            let exam = clas.exams.id(req.params.id);
            const topics = req.body.topics;
            
            exam.title = req.body.exam.title;
            exam.date = req.body.exam.date;
            exam.subject = req.body.exam.subject;
            exam.subjectName = req.body.exam.subjectName;
            exam.topics = [];
            
            for(let i = 0; i < topics.topic.length; i++) {
                const topic = {
                    topic: topics.topic[i],
                    learn: topics.learn[i]
                };
                exam.topics.push(topic);
            }
        } else {
            console.log("no exam with the given ID existst");
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        }
        
        clas.save(err2 => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
            }
            res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/exams`);
        });
    });
});

module.exports = router;