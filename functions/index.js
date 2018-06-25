let functionsObj = {};

// function for a complete error handle
functionsObj.error = (req, res, err, msg, path) => {
    // log error
    if(err != "") console.log(err);
    // flash error
    req.flash("error", msg);
    // redirect user
    res.redirect(path);
};

module.exports = functionsObj;