const express = require("express");
const router  = express.Router();

router.get("/", (req, res)  =>
    res.render("homework/index")
);

module.exports = router;