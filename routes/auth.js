// ========================
// User Auth Routing
// ========================

// Packages
const express        = require("express"),
    passport         = require("passport"),
    passwordHash     = require("password-hash"),
    fun              = require("../functions"),
    middleware       = require("../middleware");

const router = express.Router();

router.get("/register", middleware.isNotLoggedIn, (req, res) => {
    res.render("auth/register");
});

router.post("/register2", middleware.isNotLoggedIn, (req, res) => {
    
    req.checkBody("username", "Username field cannot be empty").notEmpty();
    req.checkBody("username", "Username must be between 4-15 characters long").len(4, 15);
    req.checkBody("password", "Password field cannot be empty").notEmpty();
    req.checkBody("password", "Password must be at least 8 characters long").len(8, 100);
    req.checkBody("reenterPassword", "Passwords do not match, please try again").equals(req.body.password);
    
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, "", errors[0].msg, "/register")}
    
    const db = require("../db");
    
        
    db.query("SELECT name FROM schools", (err, results, fields) => {
        
        if(err) {return fun.error(req, res, err, "Error while loading schools")}
        
        res.render("auth/register2", {
            schools: results,
            username: req.body.username,
            password: req.body.password,
        });
    
    });
});

router.post("/register3", middleware.isNotLoggedIn, (req, res) => {
    
    req.checkBody("school", "School field cannot be empty").notEmpty();
    req.checkBody("schoolPassword", "Password field cannot be empty").notEmpty();
    req.checkBody("schoolPassword", "Password must be at least 8 characters long").len(8, 100);
    
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, "", errors[0].msg, "/register")}
    
    const db = require("../db");
    
    db.query("SELECT *, schools.name AS schoolName, schools.id AS school_id FROM schools LEFT JOIN classes ON schools.id = classes.school_id WHERE schools.name = ?", [req.body.school], (err, results, fields) => {
        
        if(err) {return fun.error(req, res, err, "Couldn't find your school", "/register")}
        
        if(passwordHash.verify(req.body.schoolPassword, results[0].password)) {
            
            res.render("auth/register3", {
                classes: results,
                username: req.body.username,
                password: req.body.password
            });
            
        } else {
            fun.error(req, res, "", "Wrong school password", "/register");
        }
    });
});

router.post("/register", middleware.isNotLoggedIn, (req, res) => {
    
    req.checkBody("school", "School field cannot be empty").notEmpty();
    req.checkBody("password", "Password field cannot be empty").notEmpty();
    req.checkBody("clas", "Clas field cannot be empty").notEmpty();
    req.checkBody("username", "Username field cannot be empty").notEmpty();
    
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, "", errors[0].msg, "/register")}
    
    const db = require("../db");
    
    const hash = passwordHash.generate(req.body.password);
        
    db.query("INSERT INTO users (username, password, class_id, school_id) VALUES (?, ?, ?, ?)", [req.body.username, hash, req.body.clas, req.body.school], (err, results, fields) => {
        
        if(err) {return fun.error(req, res, err, "Username already taken", "/register")}
        
        db.query("SELECT * FROM users WHERE username = ?", [req.body.username], (err, results, fields) => {
            
            if(err) {return fun.error(req, res, err, "Error while signing up", "/register")}
            
            req.login(results[0], (err) => {
                if(err) {return fun.error(req, res, err, "Error while signing up", "/register")}
                
                req.flash("success", "Registered successfully");
                res.redirect("/");
                
            });
        });
    });
});

router.get("/login", middleware.isNotLoggedIn, (req, res) => {
    res.render("auth/login");
});

router.post("/login", middleware.isNotLoggedIn, (req, res) => {
    
    req.checkBody("username", "Username field cannot be empty").notEmpty();
    req.checkBody("password", "Password field cannot be empty").notEmpty();
    
    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, "", errors[0].msg, "/login")}
    
    passport.authenticate("local", (err, user) => {
        
        if (err) {return fun.error(req, res, err, "Error while logging in", "/login")}
        
        // Redirect if it fails
        if (!user) {return fun.error(req, res, "", "Wrong password or username", "/login")}
        
        req.logIn(user, function(err) {
            
            if (err) {return fun.error(req, res, err, "Error while logging in", "/login")}
            
            // Redirect if it succeeds
            req.flash("success", `Welcome back ${user.username}`);
            res.redirect("/");
            
        });
    })(req, res);
});

router.get("/logout", middleware.isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;