const express = require("express");
const mid = require("../middleware");

const router  = express.Router();

// Index Route
router.get("/", mid.isNotLoggedIn, (req, res) => {
    res.render("landing");
});

// About Route
router.get("/about", (req, res) => {
    res.render("about", {
        version: process.env.VERSION
    });
});

// Download Route
router.get("/download", (req, res) => {
    res.download("app/Homework.apk");
});

module.exports = router;
