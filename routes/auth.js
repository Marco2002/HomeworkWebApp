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
router.get("/register", (req, res) => {
    res.render("auth/register1");
});

// Register 2 Route GET
router.post("/register2", (req, res) => {
    // Get all Schools
    School.find({}, (err, schools) => {
        if(err) {
            res.redirect("/home");
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
router.post("/register3", (req, res) => {
    School.findOne({name: req.body.school}).populate("clases").exec((err, school) => {
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
                    return console.log(err2);
                }
                res.render("auth/register2", {
                    schools: schools,
                    username: req.body.username,
                    password: req.body.password,
                });
            });
            console.log(err);
        }
    });
});

// Register Route POST
router.post("/register", (req, res) => {
    School.findOne({name: req.body.school}, (err2, school) => {
            if(err2) {
                console.log(err2 + 2);
                return res.redirect("/");
            }
            Class.findOne({name: req.body.clas}, (err3, clas) => {
                if(err3) {
                    console.log(err3 + 3);
                    return res.redirect("/");
                }
                User.register(new User({
                    username: req.body.username,
                    school: school._id,
                    clas: clas._id
                }), req.body.password, (err, user) => {
                    if(err) {
                        res.redirect("/register");
                        return console.log(err + 1);
                    }
                    passport.authenticate("local")(req, res, () => {
                        res.redirect(`/schools/${school._id}/classes/${clas._id}/homework`);
                    });
                });
            });
        });
});

// Login Route GET
router.get("/login", (req, res) => {
    res.render("auth/login");
});

// Login Route POST
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/",
}), (req, res) => {
    res.redirect(`/schools/${req.user.school}/classes/${req.user.clas}/homework`);
});

// Logout Route
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

module.exports = router;