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

middlewareObj.isPartOfSchool = (req, res, next) => {
    
    const db = require("../db");
    
    if(req.isAuthenticated()) {
        
        db.query("SELECT users.id FROM users WHERE id = ? AND school_id = ?", [req.user.id, req.params.school_id], (err, results, fields) => {
            
            if(err) {return fun.error(req, res, err, "School does not exist", "/")}
    
            if(results != null && results.length > 0) {
                
                return next();
                
            } else {
                
                fun.error(req, res, "", "You are not part of that school", `/classes/${req.user.class_id}/homework`);
            }
        });
    }
};

middlewareObj.isPartOfClass = (req, res, next) => {
    
    const db = require("../db");
    
    if(req.params.class_id != 0) {
        
        db.query("SELECT users.id FROM users WHERE id = ? AND class_id = ?", [req.user.id, req.params.class_id], (err, results, fields) => {
            
            if(err) {return fun.error(req, res, err, "You are not part of that class", `/classes/${req.user.class_id}/homework`)}
            
            if(results != null && results.length > 0) {
                next();
            } else {
                fun.error(req, res, "", "You are not part of that class", `/classes/${req.user.class_id}/homework`);
            }
        });
    } else {
        
        if(req.user.school_id == 0) {
            
            res.redirect("/selectSchool");
            
        } else if(req.user.class_id == 0) {
            
            res.redirect("/selectClass");
        } else {
            
            res.redirect("/");
        }
    }
};

module.exports = middlewareObj;