// ======================
// Class Routes
// ======================

// Packages
const express    = require("express");
const fun        = require("../functions");
const mid        = require("../middleware");

const router = express.Router({mergeParams: true});

// New Route
router.get("/new", mid.isLoggedIn, mid.isPartOfSchool, (req, res) => {

    res.render("classes/new", {
        school_id: req.params.school_id
    });

});

// Create Route
router.post("/", mid.isLoggedIn, mid.isPartOfSchool, (req, res) => {

    if(req.user.is_admin == 0) {

        req.checkBody("class[name]", "Class-name cannot be langer than 10 characters").notEmpty().len(0, 10);

        const errors = req.validationErrors();
        if(errors) {return fun.error(req, res, "", errors[0].msg, `/schools/${req.params.school_id}/classes/new`)}

        const db = require("../db");

        db.query("INSERT INTO classes (name, school_id) VALUES (?, ?)", [req.body.class.name, req.params.school_id], (err, results, fields) => {

            if(err) {return fun.error(req, res, err, "Error while adding your class", "/selectClass")}

            db.query("UPDATE users SET is_admin = 1, class_id = ? WHERE id = ?", [results.insertId, req.user.id], (err, results2, fields) => {

                if(err) {return fun.error(req, res, err, "Error while making you class admin", "/selectClass")}

                db.query("SELECT * FROM users WHERE id = ?", [req.user.id], (err, results, fields) => {

                    if(err) {return fun.error(req, res, err, "Error while making you class admin", "/selectClass")}

                    req.login(results[0], (err) => {

                        if(err) {return fun.error(req, res, err, "Error while signing up", "/register")}

                        res.redirect(`/classes/${results[0].class_id}/homework`);
                    });
                });
            });
        });
    } else {
        return fun.error(req, res, "", "You cannot create a class as an admin of another class", `/classes/${req.user.class_id}/homework`);
    }
});

// Show Route
router.get("/:class_id", mid.isLoggedIn, mid.updateUser, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    const db = require("../db");

    db.query("SELECT *, schools.name AS school_name, classes.name AS class_name FROM schools JOIN classes ON classes.school_id = schools.id LEFT JOIN users ON classes.id = users.class_id WHERE classes.id = ? ORDER BY username", [req.params.class_id], (err, results, fields) => {

        if(err) {return fun.error(req, res, err, "Error while loading class", `/classes/${req.user.class_id}/homework`)}

        res.render("classes/show", {
            title: "TITLE_CLASS_SETTINGS",
            results: results
        });
    });
});

// Edit Route
router.get("/:class_id/edit", mid.isLoggedIn, mid.updateUser, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    const db = require("../db");

    db.query("SELECT * FROM classes WHERE id = ?", [req.params.class_id], (err, results, fields) => {

        if(err) {return fun.error(req, res, err, "Couldn't find you class", `/classes/${req.params.class_id}/homework`)}

        res.render("classes/edit", {
            results: results
        });
    });
});

// Update Route
router.put("/:class_id", mid.isLoggedIn, mid.updateUser, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    req.checkBody("class[name]", "Class-name cannot be langer than 10 characters").notEmpty().len(0, 10);

    const errors = req.validationErrors();
    if(errors) {return fun.error(req, res, "", errors[0].msg, `/schools/${req.params.school_id}/classes/${req.params.class_id}/edit`)}

    const db = require("../db");

    db.query("UPDATE classes SET name = ? WHERE id = ?", [req.body.class.name, req.params.class_id], (err, results, fields) => {

        if(err) {return fun.error(req, res, err, "Error while updating class", `/schools/${req.params.school_id}/classes/${req.params.class_id}`)}

        req.flash("success", "Updated class successfully");
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
});

// Kick Route
router.get("/:class_id/users/:id/kick", mid.isLoggedIn, mid.updateUser, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    const db = require("../db");

    db.query("SELECT id FROM users WHERE is_admin = 1 AND class_id = ?", [req.params.class_id], (err, results, fields) => {

        if(err) {return fun.error(req, res, err, "Error while removing user from admins", `/schools/${req.params.school_id}/classes/${req.params.class_id}`)}

        if(results.length == 1 && req.params.id == results[0].id) {
            fun.error(req, res, err, "You cannot remove the last admin", `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
        } else {

            db.query("UPDATE users SET class_id = 0, is_admin = 0 WHERE id = ?", [req.params.id], (err, results, fields) => {

                if(err) {return fun.error(req, res, err, "Error while kicking from class", `/schools/${req.params.school_id}/classes/${req.params.class_id}`)}

                db.query("SELECT * FROM users WHERE id = ?", [req.user.id], (err, results, fields) => {

                    if(err) {return fun.error(req, res, err, "Error updating session", `/logout`)}

                    req.login(results[0], (err) => {

                        if(err) {return fun.error(req, res, err, "Error updating session", `/logout`)}

                        req.flash("success", "Kicked user out of class successfully");
                        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
                    });
                });
            });
        }
    });
});

// Make Admin Route
router.get("/:class_id/users/:id/admin", mid.isLoggedIn, mid.updateUser, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    const db = require("../db");

    db.query("UPDATE users SET is_admin = 1 WHERE id = ?", [req.params.id], (err, results, fields) => {

        if(err) {return fun.error(req, res, err, "Error while making user admin", `/schools/${req.params.school_id}/classes/${req.params.class_id}`)}

        req.flash("success", "Made admin successfully");
        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
    });
});

// Romove Admin Route
router.get("/:class_id/users/:id/deadmin", mid.isLoggedIn, mid.updateUser, mid.isPartOfSchool, mid.isPartOfClass, mid.isAdmin, (req, res) => {

    const db = require("../db");

    db.query("SELECT id FROM users WHERE is_admin = 1 AND class_id = ?", [req.params.class_id], (err, results, fields) => {

        if(err) {return fun.error(req, res, err, "Error while removing user from admins", `/schools/${req.params.school_id}/classes/${req.params.class_id}`)}

        if(results.length == 1) {
            fun.error(req, res, err, "You cannot remove the last admin", `/schools/${req.params.school_id}/classes/${req.params.class_id}`);
        } else {

            db.query("UPDATE users SET is_admin = 0 WHERE id = ?", [req.params.id], (err, results, fields) => {

                if(err) {return fun.error(req, res, err, "Error while removing user from admins", `/schools/${req.params.school_id}/classes/${req.params.class_id}`)}

                db.query("SELECT * FROM users WHERE id = ?", [req.user.id], (err, results, fields) => {

                    if(err) {return fun.error(req, res, err, "Error updating session", `/logout`)}

                    req.login(results[0], (err) => {

                        if(err) {return fun.error(req, res, err, "Error updating session", `/logout`)}

                        req.flash("success", "Removed admin successfully");
                        res.redirect(`/schools/${req.params.school_id}/classes/${req.params.class_id}`);
                    });
                });
            });
        }
    });
});

module.exports = router;
