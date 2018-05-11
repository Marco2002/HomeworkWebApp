//=============================
// Homework Web App
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
const path              = require('path');
const i18n              = require("i18n-express");
const LocalStrategy     = require("passport-local").Strategy;
const GoogleStrategy    = require("passport-google-oauth").OAuth2Strategy;
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
    rolling: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
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

// i18n setup
app.use(i18n({
    translationsPath: path.join(__dirname, 'i18n'),
    siteLangs: ["en", "de"]
}));

// ejs Paramenters
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Passport-Local setup
passport.use(new LocalStrategy((username, password, done) => {
    
    const db = require("./db.js");
    
    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results, fields) => {

        if(err) { return done(err) }

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

// Google OAuth setup
passport.use(new GoogleStrategy({
    
    clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_AUTH_CLIENT_CALLBACK,
        
}, (accessToken, refreshToken, profile, done) => {
        
    process.nextTick(() => {
        
        const db = require("./db.js");
    
        db.query("SELECT * FROM users WHERE google_id = ?", [profile.id], (err, results, fields) => {
    
            if(err) { return done(err) }
            
            console.log(profile);
            
            if(results.length === 0) {
                
                db.query("INSERT INTO users (username, google_id, google_token, google_image) VALUES (?, ?, ?, ?)", [profile.displayName, profile.id, accessToken, profile.image.url], (err, results, fields) => {
                    
                    if(err) { return done(err, false) }
                    
                    db.query("SELECT * FROM users WHERE google_id = ?", [profile.id], (err, results, fields) => {
                        
                        if(err) { return done(err, false) }
                        
                        return done(null, results[0]);
                    });
                });
                
            } else {
    
                return done(null, results[0]);
            }
        });
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
    
    db.query("SELECT id FROM exams WHERE date < ?",  [moment(Date.now()).add(1,"days").format("YYYY-MM-DD")], (err, results, fields) => {
        
        if(err) {
            console.log(err);
        }
        
        db.query("DELETE FROM topics WHERE exam_id = ?", [results[0].id], (err, results, fields) => {
            
            if(err) {
                console.log(err);
            }
            
            db.query("DELETE FROM exams WHERE date < ?", [moment(Date.now()).add(1,"days").format("YYYY-MM-DD")], (err, results, fields) => {
        
                if(err) {
                    console.log(err);
                }
                    
                console.log("deleted exams");
            });
        });
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
