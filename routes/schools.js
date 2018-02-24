// ======================
// School Routes
// ======================

// Packages
const express    = require("express"),
    passwordHash = require('password-hash'),

// Modules
    School  = require("../models/school");

const router = express.Router();

// New Route
router.get("/new", (req, res) => {
    res.render("schools/new");
});

// Create Route
router.post("/", (req, res) => {
    req.body.school.password = passwordHash.generate(req.body.school.password);
    School.create(req.body.school, (err, newSchool) => {
        if(err) {
            res.redirect("/");
            req.flash("succes", "Error while adding your school");
            return console.log(err);
        }
        res.redirect("/");
    });
});

module.exports = router;