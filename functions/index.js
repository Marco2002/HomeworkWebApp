let functionsObj = {};

functionsObj.error = (req, res, err, msg, path) => {
    if(err != "") {console.log(err)}
    req.flash("error", msg);
    res.redirect(path);
};

module.exports = functionsObj;