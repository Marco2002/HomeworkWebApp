// ======================
// School Routes
// ======================

// Packages
const express   = require("express"),
    bcrypt      = require('bcrypt'),
    fun         = require("../functions");

const router = express.Router();

// New Route
router.get("/new", (req, res) => {
    res.render("schools/new");
});

// Create Route
router.post("/", (req, res) => {
    
    req.checkBody("school[name]", "School-name field cannot be empty").notEmpty();
    req.checkBody("school[name]", "School-name must be between 4-30 characters long").len(4, 30);
    req.checkBody("school[password]", "Password field cannot be empty").notEmpty();
    req.checkBody("school[password]", "Password must be at least 8 characters long").len(8, 100);
    req.checkBody("reenterPassword", "Passwords do not match, please try again").equals(req.body.school.password);
    
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, "", errors[0].msg, "/schools/new")}
    
    const db = require("../db");
    
    bcrypt.hash(req.body.school.password, 10, (err, password) => {
        if(err) { return fun.error(req, res, err, "Error while adding School", "/schools/new") }
        
        db.query("INSERT INTO schools (name, password) VALUES (?, ?)", [req.body.school.name, password], (err, results, fields) => {
            if(err) { return fun.error(req, res, err, "Error while adding School", "/schools/new") }
            
            req.flash("success", "Added School successfully");
            res.redirect("/");
        });
    });
});

module.exports = router;