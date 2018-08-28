// ====================
// middleware functions
// ====================

// Packages
const fun = require('../functions');

// Models
const User = require('../models/user');
const Class = require('../models/class');

let middlewareObj = {};

// make sure user is logged in
middlewareObj.isLoggedIn = (req, res, next) => {
    
    if(req.isAuthenticated()) {
        // user is logged in => next();
        return next();
    }
    // user is not logged in
    fun.error(req, res, '', 'You must be logged in in order to do that', '/');
};

// make sure user is not logged in
middlewareObj.isNotLoggedIn = (req, res, next) => {
    
    if(!req.isAuthenticated()) {
        // user is not logged in => next();
        return next();
    }

    res.redirect(`/classes/${req.user.class_id}/homework`);
};

// check if user is part of school in parameter
middlewareObj.isPartOfSchool = (req, res, next) => {
    
    // make sure user is in some school
    if(req.user.school_id != undefined) {
        
        if(req.user.school_id == req.params.school_id) {
            // user is part of school
            next();
        } else {
            // user is not part of school
            fun.error(req, res, '', 'You are not part of that school', `/classes/${req.user.class_id}/homework`);
        }

    } else {
        // user is in no school => select school
        res.redirect('/selectSchool');
    }
};

// check if user is part of class in parameter
middlewareObj.isPartOfClass = (req, res, next) => {
    
    // make sure user is in a school and in a class
    if(req.user.class_id != undefined && req.user.school_id != undefined) {
        
        if(req.user.class_id == req.params.class_id) {
            // user is part of class
            next();
        } else {
            // user is not part of class
            fun.error(req, res, '', 'You are not part of that class', `/classes/${req.user.class_id}/homework`);
        }
    } else {
        
        if(req.user.school_id == undefined) {
            // user is in no school => select school
            res.redirect('/selectSchool');
            
        } else {
            // user is in no class => select class
            res.redirect('/selectClass');
        }
    }
};

middlewareObj.hasSelectedSubjects = (req, res, next) => {
    // check if user has selected his subjects
    if(req.user.subjects.length !== 0) {
        next();
    } else {
        // user hasn't selected any subjects
        res.redirect('/selectSubjects');
    }
};

// check if user is admin
middlewareObj.isAdmin = (req, res, next) => {
    
    if(req.user.power == 2) {
        next();
    } else {
        fun.error(req, res, '', 'You need to be class admin to do that', `/classes/${req.user.class_id}/homework`);
    }
};

middlewareObj.isNotRestricted = (req, res, next) => {
    
    if(req.user.power > 0) {
        next();
    } else {
        fun.error(req, res, '', 'You are not allowed to do that', `/classes/${req.user.class_id}/homework`);
    }
};

middlewareObj.isNotLastAdmin = (req, res, next) => {
    // find all admins
    User.find({
        power: 2,
        class_id: req.user.class_id
    }).then(admins => {
        // make sure user is not last admin
        if(!(admins.length == 1 && admins[0]._id == req.user._id)) {
            // user is not last admin
            next();
        } else {
            // user is last admin
            fun.error(req, res, '', 'You cannot do that as the only admin of your class', `/classes/${req.user.class_id}/homework`);
        }
    }, err => {
        // handle err
        fun.error(req, res, err, 'Error while finding admins', `/classes/${req.user.class_id}/homework`);
    });
};

middlewareObj.updateUser = (req, res, next) => {
    
    // find current user
    User.findOne({_id: req.user._id})
    .then( user => {
        req.login(user, (err) => {
            // handle possible error
            if(err) {return fun.error(req, res, err, 'Error while updating session', `/classes/${user.class_id}/homework`)}
            
            next();
        });
    }, err => {
        // handle error
        fun.error(req, res, err, 'Error while updating session', `/classes/${req.user.class_id}/homework`);
    });
};

middlewareObj.classHasSubjects = (req, res, next) => {
    // find class
    Class.findById({_id: req.params.class_id})
    .then(clas => {
        // check if class has more than one subejct
        clas.subjects.length > 1
            ? next()
            : fun.error(req, res, '', 'Cannot delete the last subject', `/schools/${req.user.school_id}/classes/${req.user.class_id}/`);
    }, err => {
        // handle error
        fun.error(req, res, err, 'Error while updating session', `/schools/${req.user.school_id}/classes/${req.user.class_id}/`);
    });
};

middlewareObj.isDev = (req, res, next) => {
    // check if user is dev 
    req.user.username == process.env.DEV_USERNAME 
        ? next() 
        : fun.error(req, res, '', 'That route is only for the developer', `/classes/${req.user.class_id}/homework`);
};

module.exports = middlewareObj;