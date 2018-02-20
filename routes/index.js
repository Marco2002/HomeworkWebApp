const express = require("express"),

    middleware = require("../middleware");
    
const router  = express.Router();

// Index Route
router.get("/", middleware.isNotLoggedIn, (req, res) => 
    res.render("index", {
        title: "HMWK, a homework organizor"
    })
);

module.exports = router;