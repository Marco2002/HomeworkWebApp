// ========================
// User Auth Routing
// ========================

// Packages
const express    = require("express"),
    passport     = require("passport"),
    passwordHash = require('password-hash'),
    
    middleware = require("../middleware"),

// Models
    User    = require("../models/user"),
    School  = require("../models/school"),
    Class   = require("../models/class");

const router = express.Router();

// Register 1 Route GET
router.get("/register", middleware.isNotLoggedIn, (req, res) => {
    res.render("auth/register1");
});

// Register 2 Route GET
router.post("/register2", middleware.isNotLoggedIn, (req, res) => {
    // Get all Schools
    School.find({}, (err, schools) => {
        if(err) {
            res.redirect("/");
            req.flash("error", "Error while loading the schools");
            return console.log(err);
        }
        res.render("auth/register2", {
            schools: schools,
            username: req.body.username,
            password: req.body.password,
        });
    });
});

// Register 3 Route GET
router.post("/register3", middleware.isNotLoggedIn, (req, res) => {
    School.findOne({name: req.body.school}).populate("clases").exec((err, school) => {
        if(err) {
            res.redirect("/");
            req.flash("error", "Couldn't find your school");
            return console.log(err);
        }
        
        if(passwordHash.verify(req.body.schoolPassword, school.password)) {
            res.render("auth/register3", {
                school: school,
                username: req.body.username,
                password: req.body.password
            });
        } else {
            School.find({}, (err2, schools) => {
                if(err2) {
                    res.redirect("/");
                    req.flash("error", "Error while loading the schools");
                    return console.log(err2);
                }
                req.flash("error", "Wrong school or password");
                res.render("auth/register2", {
                    schools: schools,
                    username: req.body.username,
                    password: req.body.password,
                });
            });
        }
    });
});

// Register Route POST
router.post("/register", middleware.isNotLoggedIn, (req, res) => {
    School.findOne({name: req.body.school}, (err2, school) => {
        if(err2) {
            console.log(err2);
            req.flash("error", "Couldn't find your school");
            return res.redirect("/");
        }
        Class.findOne({name: req.body.clas}, (err3, clas) => {
            if(err3) {
                console.log(err3);
                req.flash("error", "Couldn't find your class");
                return res.redirect("/");
            }
            User.register(new User({
                username: req.body.username,
                school: school._id,
                clas: clas._id
            }), req.body.password, (err, user) => {
                if(err) {
                    res.redirect("/register");
                    req.flash("error", err.message);
                    return console.log(err);
                }
                passport.authenticate("local")(req, res, () => {
                    req.flash("success", `Registered successfully. Welcome ${user.username}`);
                    res.redirect(`/schools/${school._id}/classes/${clas._id}/homework`);
                });
            });
        });
    });
});

// Login Route GET
router.get("/login", middleware.isNotLoggedIn, (req, res) => {
    res.render("auth/login");
});

// Login Route POST
router.post("/login", middleware.isNotLoggedIn, (req, res) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.log(err);
            req.flash("error", "Error while logging in");
            return res.redirect("/login");
        }
        // Redirect if it fails
        if (!user) {
            req.flash("error", "Wrong password or username");
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) { 
                console.log(err);
                req.flash("error", "Error while logging in");
                return res.redirect("/login");
            }
            // Redirect if it succeeds
            req.flash("success", `Welcome back ${user.username}`);
            res.redirect(`/schools/${req.user.school}/classes/${req.user.clas}/homework`);
        });
    })(req, res);
});

// Logout Route
router.get("/logout", middleware.isLoggedIn, (req, res) => {
    req.logout();
    req.flash("success", "Logged out successfully");
    res.redirect("/");
});

module.exports = router;