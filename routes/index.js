const express = require("express");
const middleware = require("../middleware");

const router  = express.Router();

// Index Route
router.get("/", middleware.isNotLoggedIn, (req, res) => {
    res.render("index");
});

router.get("/download", (req, res) => {
    req.flash("success", "Downloaded the app");
    res.download("app/Homework.apk");
});

module.exports = router;
