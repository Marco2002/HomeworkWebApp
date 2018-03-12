const express = require("express"),
    middleware = require("../middleware");

const router  = express.Router();

// Index Route
router.get("/", middleware.isNotLoggedIn, (req, res) => {
    res.render("index");
});

router.get("/download", (req, res) => {
    res.download("app/homework.apk");
    req.flash("success", "Downloaded the app");
    res.redirect("/");
});

module.exports = router;
