//=============================
// HMWK v0.7
//=============================

// Packages
const express               = require("express"),
    mongoose                = require("mongoose"),
    bodyParser              = require("body-parser"),
    methodOverride          = require("method-override"),
    passport                = require("passport"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    expressSession          = require("express-session"),
    flash                   = require("connect-flash"),
    
    LocalStrategy           = require("passport-local"),
    
// Models
    User        = require("./models/user"),
    School      = require("./models/school"),
    Class       = require("./models/class"),

// Routes
    indexRoutes     = require("./routes/index"),
    homeworkRoutes  = require("./routes/homework"),
    examRoutes      = require("./routes/exams"),
    authRoutes      = require("./routes/auth"),
    schoolRoutes    = require("./routes/schools"),
    classRoutes     = require("./routes/classes");

// express setup
const app = express();

// env variables setup
require("dotenv/config");

// mongoose setup
mongoose.connect("mongodb://localhost/homework_v0_6");

// ejs setup
app.set("view engine", "ejs");

// passport and session setup
app.use(expressSession({
    secret: process.env.COOKIE_SECRET,
    name: 'cookie_name',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session({
    secret: process.env.COOKIE_SECRET,
    name: 'cookie_name',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// setup public directory
app.use(express.static(__dirname + "/public"));

// body-parser setup
app.use(bodyParser.urlencoded({extended: true}));

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

// Routes setup
app.use(indexRoutes);
app.use(authRoutes);
app.use("/schools/:school_id/classes/:class_id/homework", homeworkRoutes);
app.use("/schools/:school_id/classes/:class_id/exams", examRoutes);
app.use("/schools", schoolRoutes);
app.use("/schools/:school_id/classes", classRoutes);

app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () =>
    console.log(`server online on HOST:${process.env.SERVER_HOST}, PORT:${process.env.SERVER_PORT}`)
);