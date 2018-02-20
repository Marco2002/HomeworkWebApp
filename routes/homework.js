//======================
// /homework routing
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
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        }
        School.findById(req.params.school_id, (err2, school) => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
            }
            res.render("homework/new", {
                title: "Add Homework",
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
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        }
        clas.homework.push(req.body.homework);
        clas.save(err2 => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
            }
            res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        });
    });
});

// Show Route
router.get("/:id", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        }
        School.findById(req.params.school_id, (err2, school) => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
            }
            if (clas.homework.id(req.params.id)) {
                res.render("homework/show", {
                    title: clas.homework.id(req.params.id).title,
                    clas: clas,
                    school: school,
                    h: clas.homework.id(req.params.id)
                });
            } else {
                console.log("no homework with the given ID existst");
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
            }
        });
    });
});

// Destroy Route
router.delete("/:id", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        }
        if (clas.homework.id(req.params.id)) {
            clas.homework.id(req.params.id).remove();
        } else {
            console.log("no homework with the given ID existst");
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        }
        
        clas.save(err2 => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
            }
            res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        });
    });
});

// Edit Route
router.get("/:id/edit", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        }
        School.findById(req.params.school_id, (err2, school) => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
            }
            if (clas.homework.id(req.params.id)) {
                res.render("homework/edit", {
                    title: "Edit Homework",
                    clas: clas,
                    school: school,
                    h: clas.homework.id(req.params.id)
                });
            } else {
                console.log("no homework with the given ID existst");
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
            }
        });
    });
});

// Update Route
router.put("/:id", middleware.isLoggedIn, (req, res) => {
    Class.findById(req.params.class_id, (err, clas) => {
        if(err) {
            console.log(err);
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        }
        if (clas.homework.id(req.params.id)) {
            let homework = clas.homework.id(req.params.id);
            homework.title = req.body.homework.title;
            homework.date = req.body.homework.date;
            homework.subject = req.body.homework.subject;
            homework.subjectName = req.body.homework.subjectName;
            homework.description = req.body.homework.description;
            homework = req.body.homework;
        } else {
            console.log("no homework with the given ID existst");
            return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        }
        clas.save(err2 => {
            if(err2) {
                console.log(err2);
                return res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
            }
            res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}/homework`);
        });
    });
});

module.exports = router;