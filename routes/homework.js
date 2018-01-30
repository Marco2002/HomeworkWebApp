//======================
// /homework routing
//======================

// Packages
const express = require("express"),

// Models
    Homework = require("../models/homework");
    
const router  = express.Router();

// Index Route
router.get("/", (req, res) => {
    // Get all homework from DB
    Homework.find({}, function(err, homework) {
        if(err) {
            console.log(err);
        }
        res.render("homework/index", {
            title: "Homework",
            homework: homework,
        });
    });
});

// New Route
router.get("/new", (req, res) => 
    res.render("homework/new", {
        title: "Add Homework"
    })
);

// Create Route
router.post("/", function(req, res) {
    // Create new homework and save to DB
    Homework.create(req.body.homework, function(err, newHomework) {
        if(err) {
            res.redirect("/homework");
            return console.log(err);
        }
        console.log("Homework added:");
        console.log(newHomework);
        res.redirect("/homework");
    });
});

module.exports = router;