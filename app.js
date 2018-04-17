//=============================
// HMWK v0.7
//=============================

// Packages
const express           = require("express");
const bodyParser        = require("body-parser");
const methodOverride    = require("method-override");
const passport          = require("passport");
const expressSession    = require("express-session");
const flash             = require("connect-flash");
const expressValidator  = require("express-validator");
const moment            = require("moment");
const cookieParser      = require('cookie-parser');
const passwordHash      = require("password-hash");
const schedule          = require("node-schedule");

const LocalStrategy     = require("passport-local").Strategy;
const MySQLStore        = require("express-mysql-session");

// Routes
const indexRoutes     = require("./routes/index");
const schoolRoutes    = require("./routes/schools");
const homeworkRoutes  = require("./routes/homework");
const examRoutes      = require("./routes/exams");
const authRoutes      = require("./routes/auth");
const classRoutes     = require("./routes/classes");

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
    name: 'hmwk',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
	done(null, user);
});

// express-validator setup
app.use(expressValidator());

// method-override setup
app.use(methodOverride("_method"));

// connect-flash setup
app.use(flash());

// ejs Paramenters
app.use((req, res, next) => {
    res.locals.user = req.user;
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

            if(passwordHash.verify(password, results[0].password)) {

                return done(null, results[0]);

            } else {
                done(null, false);
            }
        }
    });
}));


// trigger once a day to delete all homework
schedule.scheduleJob("0 0 12 * * *", () => {
    
    const db = require("./db");
    
    db.query("DELETE FROM homework WHERE date < ?", [moment(Date.now()).add(1,"days").format("YYYY-MM-DD")], (err, results, fields) => {
        
        if(err) {
            console.log(err);
        }
        
        console.log("deleted homework");
    });
    
    db.query("DELETE FROM exams WHERE date < ?", [moment(Date.now()).add(1,"days").format("YYYY-MM-DD")], (err, results, fields) => {
        
        if(err) {
            console.log(err);
        }
        
        console.log("deleted exams");
    });
});

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
