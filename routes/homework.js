//======================
// /homework routing
//======================

// Packages
const express  = require("express"),
    middleware = require("../middleware"),

// Models
    Homework = require("../models/homework");
    
const router  = express.Router();

// Index Route
router.get("/", middleware.isLoggedIn, (req, res) => {
    // Get all homework from DB
    Homework.find({}, (err, homework) => {
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
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("homework/new", {
        title: "Add Homework"
    });
});

// Create Route
router.post("/", middleware.isLoggedIn, (req, res) => {
    // Create new homework and save to DB
    Homework.create(req.body.homework, (err, newHomework) => {
        if(err) {
            res.redirect("/homework");
            return console.log(err);
        }
        console.log("Homework added:");
        console.log(newHomework);
        res.redirect("/homework");
    });
});

// Show Route
router.get("/:id", middleware.isLoggedIn, (req, res) => {
    Homework.findById(req.params.id, (err, homework) => {
      if(err) {
          res.redirect("/homework");
          return console.log(err);
      }  
      // render the template with the homework
      res.render("homework/show", {
          title: homework.title,
          h: homework,
      });
    });
});

// Destroy Route
router.delete("/:id", middleware.isLoggedIn, (req, res) => {
    Homework.findByIdAndRemove(req.params.id, (err) => {
        if(err) {
            console.log(err);
            return res.redirect("/homework");
        }
        res.redirect("/homework");
    });
});

// Edit Route
router.get("/:id/edit", middleware.isLoggedIn, (req, res) => {
    Homework.findById(req.params.id, (err, homework) => {
        if(err) {
            res.redirect("/homework");
            return console.log(err);
        }
        res.render("homework/edit", {
            title: "Edit Homework",
            h: homework
        });
    });
});

// Update Route
router.put("/:id", middleware.isLoggedIn, (req, res) => {
    Homework.findByIdAndUpdate(req.params.id, req.body.homework, (err, homework) => {
        if(err) {
            req.redirect("/homework");
            return console.log(err);
        }
        res.redirect(`/homework/${req.params.id}`);
    });
});

module.exports = router;