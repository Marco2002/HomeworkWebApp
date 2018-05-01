const fun = require("../functions");

let middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
    
    if(req.isAuthenticated()) {
        
        return next();
    }
    
    fun.error(req, res, "", "You must be logged in in order to do that", "/");
};

middlewareObj.isNotLoggedIn = (req, res, next) => {
    
    if(!req.isAuthenticated()) {
        return next();
    }

    res.redirect(`/classes/${req.user.class_id}/homework`);
};

middlewareObj.isPartOfSchool = (req, res, next) => {
    
    const db = require("../db");
    
    if(req.user.school_id != 0) {
            
        db.query("SELECT users.id FROM users WHERE id = ? AND school_id = ?", [req.user.id, req.params.school_id], (err, results, fields) => {
            
            if(err) {return fun.error(req, res, err, "School does not exist", "/")}
    
            if(results != null && results.length > 0) {
            
                return next();
                
            } else {
                
                fun.error(req, res, "", "You are not part of that school", `/classes/${req.user.class_id}/homework`);
            }
        });
    } else {
        
        res.redirect("/selectSchool");
    }
};

middlewareObj.isPartOfClass = (req, res, next) => {
    
    const db = require("../db");
    
    if(req.user.class_id != 0 && req.user.school_id != 0) {
        
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
            
            res.redirect("/selectClass");
        }
    }
};

middlewareObj.isAdmin = (req, res, next) => {
    
    if(req.user.is_admin) {
        next();
    } else {
        fun.error(req, res, "", "You need to be class admin to do that", `/classes/${req.user.class_id}/homework`);
    }
};

middlewareObj.isUser = (req, res, next) => {
    
    if(req.params.user_id == req.user.id) {
        next();
    } else {
        fun.error(req, res, "", "You aren't logged in as that user", `/${req.user.id}`);
    }
};

middlewareObj.updateUser = (req, res, next) => {
    
    const db = require("../db");
    
    db.query("SELECT * FROM users WHERE id = ?", [req.user.id], (err, results, fields) => {
        
        if(err) {return fun.error(req, res, err, "Error while updating session", `/classes/${req.user.class_id}/homework`)}
        
        if(req.user == results[0]) {
            
            next();
        } else {
            
            req.login(results[0], (err) => {

                if(err) {return fun.error(req, res, err, "Error while updating session", `/classes/${req.user.class_id}/homework`)}

                next();
            });
        }
    });
};

module.exports = middlewareObj;