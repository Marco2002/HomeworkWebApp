// ======================
// Class Routes
// ======================

// Packages
const express  = require("express"),
    fun        = require("../functions");
    
const router = express.Router({mergeParams: true});

// New Route
router.get("/new", (req, res) => {
    
    res.render("classes/new", {
        school_id: req.params.school_id
    });
    
});

router.post("/", (req, res) => {
    
    req.checkBody("class[name]", "Class-name field cannot be empty").notEmpty();
    req.checkBody("class[name]", "Class-name cannot be langer than 10 characters").len(0, 10);
    
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, "", errors[0].msg, `/schools/${req.params.school_id}/classes/new`)}
    
    const db = require("../db");
    
    db.query("INSERT INTO classes (name, school_id) VALUES (?, ?)", [req.body.class.name, req.params.school_id], (err, results, fields) => {
        
        if(err) {return fun.error(req, res, err, "Error while adding your class", "/")}
        
        req.flash("success", "Added class successfully");
        res.redirect("/");
        
    });
});

module.exports = router;