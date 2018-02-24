// ======================
// Class Routes
// ======================

// Packages
const express  = require("express"),

// Modules
    Class   = require("../models/class"),
    School  = require("../models/school");

const router = express.Router({mergeParams: true});

// New Route
router.get("/new", (req, res) => {
    School.findById(req.params.school_id, (err, school) => {
        if(err) {
            res.redirect("/");
            req.flash("error", "Couldn't find your school");
            return console.log(err);
        }
        res.render("classes/new", {
            school: school
        });
    });
});

router.post("/", (req, res) => {
    Class.create(req.body.class, (err, clas) => {
        if(err) {
            console.log(err);
            req.flash("error", "Couldn't find your class");
            return res.redirect("back");
        }
        School.findById(req.params.school_id, (err2, school) => {
            if(err2) {
                console.log(err);
                req.flash("error", "Couldn't find your school");
                return res.redirect("back");
            }
            school.clases.push(clas._id);
            school.save(err => {
                if(err) {
                    console.log(err);
                    req.flash("error", "Error while saving your class");
                    return res.redirect("back");
                }
                req.flash("success", "Added class successfully");
            });
        });
        res.redirect("/");
    });
});

module.exports = router;