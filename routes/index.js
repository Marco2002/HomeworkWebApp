const express = require("express");
const router  = express.Router();

router.get("/", (req, res) => 
    res.render("index", {
        title: "HMWK, a homework organizor"
    })
);

module.exports = router;