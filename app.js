// =============================
// Homework Web App
// =============================

// ==========
// index file
// ==========

// Packages
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const passport = require('passport');
const expressSession = require('express-session');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const moment = require('moment');
const cookieParser = require('cookie-parser');
const schedule = require('node-schedule');
const path = require('path');
const i18n = require('i18n-express');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const MongoStore = require('connect-mongo')(expressSession);

// Models
const User = require('./models/user');
const Homework = require('./models/homework');
const Exam = require('./models/exam');

// Routes
const indexRoutes = require('./routes/index');
const schoolRoutes = require('./routes/schools');
const homeworkRoutes = require('./routes/homework');
const examRoutes = require('./routes/exams');
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');

// express()
const app = express();

// env variables setup
require('dotenv/config');

// ejs setup
app.set('view engine', 'ejs');

// setup public directory
app.use(express.static(__dirname + '/public'));

// cookie-parser setup
app.use(cookieParser());

// body-parser setup
app.use(bodyParser.urlencoded({extended: true}));

// mongoDB setup
// connect to DB
mongoose.connect(process.env.MONGO_DB) // mongoDB url
.then(() => {
     // log connection
    console.log(`connected to DB: ${mongoose.connection.db.databaseName}`);
}, err => {
    // handle error
    console.log(err);
});

mongoose.connection.on('connected', () => { // when connected to mongoDB
    // Session store
    const store = new MongoStore({
        url: process.env.MONGO_DB, // mongoDB url
        ttl: 12 * 30 * 24 * 60 * 60 // session ttl
    });
    
    // session setup
    app.use(expressSession({
        secret: process.env.COOKIE_SECRET,
        name: process.env.COOKIE_NAME,
        resave: false,
        rolling: true, // update ttl after reconnect
        saveUninitialized: false,
        store: store, // set mongoDB store
        cookie: {
            maxAge: 12 * 30 * 24 * 60 * 60 * 1000 // 1 Year
        }
    }));
    
    // passport setup
    app.use(passport.initialize());
    // session setup
    app.use(passport.session());
    
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    
    // express-validator setup
    app.use(expressValidator());
    
    // method-override setup
    app.use(methodOverride('_method')); // parameter _method
    
    // connect-flash setup
    app.use(flash());
    
    // i18n setup
    app.use(i18n({
        translationsPath: path.join(__dirname, 'i18n'), // path ./i18n
        siteLangs: ['en', 'de'] // languages
    }));
    
    // ejs Paramenters
    app.use((req, res, next) => {
        res.locals.user = req.user;
        res.locals.error = req.flash('error');
        res.locals.success = req.flash('success');
        // HelmholtzschuleApp
        res.locals.hhsapp = req.query.hhsapp
        next();
    });
    
    // Passport-Local setup
    passport.use(new LocalStrategy(User.authenticate()));

    // Google OAuth setup
    passport.use(new GoogleStrategy({
        
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_AUTH_CLIENT_CALLBACK,
        
    }, (accessToken, refreshToken, profile, done) => {
            
        process.nextTick(() => {
            
            // find or create user with google_id
            User.findOne({google_id: profile.id})
            .then(user => {
                
                if(!user) {
                    // get user img
                    let imageUrl = '';
                    if (profile.photos && profile.photos.length) {
                        imageUrl = profile.photos[0].value;
                    }

                    // if no user exists, create user
                    user = new User({
                        username: profile.displayName,
                        google_id: profile.id,
                        google_token: accessToken,
                        google_image: imageUrl
                    });
                    console.log(user)
                    // save user in DB
                    user.save(err => {
                        // handel error
                        if(err) { return done(err, false) }
                        console.log(user)
                        // auth successful
                        return done(null, user);
                    });
                    
                } else {
                    // user exists => login user
                    return done(null, user);
                }
                
            }, err => {
                // handle error
                return done(err);
            });
        });
    }));
    
    // trigger once a day to delete all homework
    schedule.scheduleJob('0 0 12 * * *', () => { // at 12:00
        const date = moment(Date.now()).add(1,'days').format('YYYY-MM-DD');
        
        Homework.deleteMany({date: {$lt: date}}, err => {
            // log err if it exisits
            if(err) {
                console.log(err);
            }
            // success
            console.log(`deleted homework at date: ${date}`);
        });
        
        Homework.deleteMany({date: {$lt: date}}, err => {
            // log err if it exisits
            if(err) {
                console.log(err);
            }
            // success
            console.log(`deleted exams at date: ${date}`);
        });
    });
    
    // Routes setup
    app.use(indexRoutes);
    app.use(authRoutes);
    app.use('/schools', schoolRoutes);
    app.use('/schools/:school_id/classes', classRoutes);
    app.use('/classes/:class_id/exams', examRoutes);
    app.use('/classes/:class_id/homework', homeworkRoutes);
    
    // start server
    app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
        console.log(`server online on HOST:${process.env.SERVER_HOST}, PORT:${process.env.SERVER_PORT}`); // log server location info
        console.log(`version: ${process.env.VERSION}`); // log backend version
    });
});
