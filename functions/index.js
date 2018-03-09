let functionsObj = {};

functionsObj.error = (req, res, err, msg, path) => {
    console.log(err);
    req.flash("error", msg);
    res.redirect(path);
};

module.exports = functionsObj;