//=============================
// HMWK v0.7
//=============================

// Packages
const express               = require("express"),
    bodyParser              = require("body-parser"),
    methodOverride          = require("method-override"),
    passport                = require("passport"),
    expressSession          = require("express-session"),
    flash                   = require("connect-flash"),
    expressValidator        = require("express-validator"),
    cookieParser            = require('cookie-parser'),
    bcrypt                  = require("bcrypt"),
    LocalStrategy           = require("passport-local").Strategy,
    MySQLStore              = require("express-mysql-session"),

// Routes
    indexRoutes     = require("./routes/index"),
    schoolRoutes    = require("./routes/schools"),
    homeworkRoutes  = require("./routes/homework"),
    examRoutes      = require("./routes/exams"),
    authRoutes      = require("./routes/auth"),
    classRoutes     = require("./routes/classes");

// express setup
const app = express();

// env variables setup
require("dotenv/config");

// mysql setup
require("./db.js");

// ejs setup
app.set("view engine", "ejs");

// setup public directory
app.use(express.static(__dirname + "/public"));

// cookie-parser setup
app.use(cookieParser());

// body-parser setup
app.use(bodyParser.urlencoded({extended: true}));

// passport and session setup
const options = {
    port: process.env.MYSQL_PORT,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
};

const sessionStore = new MySQLStore(options);

app.use(expressSession({
    secret: process.env.COOKIE_SECRET,
    name: 'hmwkSession',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((id, done) => {
    done(null, id);
});
passport.deserializeUser((id, done) => {
	done(null, id);
});

// express-validator setup
app.use(expressValidator());

// method-override setup
app.use(methodOverride("_method"));

// connect-flash setup
app.use(flash());

// ejs Paramenters
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// passport-lacal setup
passport.use(new LocalStrategy((username, password, done) => {
    const db = require("./db.js");
    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results, fields) => {
        
        if(err) {
            done(err);
        }
        
        if(results.length === 0) {
            done(null, false);
        } else {
    
            bcrypt.compare(password, results[0].password.toString(), (err, response) => {
                
                if(err) {
                    done(err);
                }
                
                if(response === true) {
                    return done(null, results[0]);
                } else {
                    done(null, false);
                }
            });
            
        }
    });
}));

// Routes setup
app.use(indexRoutes);
app.use(authRoutes);
app.use("/schools", schoolRoutes);
app.use("/schools/:school_id/classes", classRoutes);
app.use("/classes/:class_id/exams", examRoutes);
app.use("/classes/:class_id/homework", homeworkRoutes);

// start server
app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`server online on HOST:${process.env.SERVER_HOST}, PORT:${process.env.SERVER_PORT}`);
});