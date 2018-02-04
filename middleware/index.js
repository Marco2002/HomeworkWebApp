var User = require("../models/user");

let middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
};

module.exports = middlewareObj;