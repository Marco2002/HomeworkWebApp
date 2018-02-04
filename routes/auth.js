// ========================
// User Auth Routing
// ========================

// Packages
const express = require("express"),
    passport  = require("passport"),

// Models
    User = require("../models/user");

const router = express.Router();

// Register Route GET
router.get("/register", (req, res) => {
    res.render("auth/register");
});

// Register Route POST
router.post("/register", (req, res) => {
    User.register(new User({
        username: req.body.username,
    }), req.body.password, (err, user) => {
        if(err) {
            res.redirect("/register");
            return console.log(err);
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/homework");
        });
    });
});

// Login Route GET
router.get("/login", (req, res) => {
    res.render("auth/login");
});

// Login Route POST
router.post("/login", passport.authenticate("local", {
    successRedirect: "/homework",
    failureRedirect: "/",
}), (req, res) => {
});

// Logout Route
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/")
});

module.exports = router;