let middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must be logged in order to do that");
    res.redirect("/");
};

middlewareObj.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        return next();
    }

    res.redirect(`/classes/${req.user.class_id}/homework`);
};

module.exports = middlewareObj;