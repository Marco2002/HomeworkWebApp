const fun = require("../functions");

let middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
    
    if(req.isAuthenticated()) {
        
        return next();
    }
    fun.error(req, res, "", "You must be logged in order to do that", "/");
};

middlewareObj.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        return next();
    }

    res.redirect(`/classes/${req.user.class_id}/homework`);
};

middlewareObj.classExists = (req, res, next) => {
    
    const db = require("../db");
    
    db.query("SELECT 1 FROM classes WHERE EXISTS(SELECT classes.id FROM classes WHERE id = ?)", [req.params.class_id], (err, results, fields) => {

        if(err) {return fun.error(req, res, err, "Class does not exist", "/")}
            
        if(results != null && results.length > 0) {
            
            next();
            
        } else {
            
            if(req.isAuthenticated()) {
                fun.error(req, res, "", "Class does not exist", `/classes/${req.user.class_id}/homework`);
            } else {
                fun.error(req, res, "", "Class does not exist", "/");
            }
            
        }
    });
};

middlewareObj.schoolExists = (req, res, next) => {
    
    const db = require("../db");
    
    db.query("SELECT 1 FROM schools WHERE EXISTS(SELECT schools.id FROM schools WHERE id = ?)", [req.params.school_id], (err, results, fields) => {
        
        if(err) {return fun.error(req, res, err, "School does not exist", "/")}

        if(results != null && results.length > 0) {
            
            next();
            
        } else {
            
            if(req.isAuthenticated()) {
                fun.error(req, res, "", "School does not exist", `/classes/${req.user.class_id}/homework`);
            } else {
                fun.error(req, res, "", "School does not exist", "/");
            }
        }
    });
};

module.exports = middlewareObj;