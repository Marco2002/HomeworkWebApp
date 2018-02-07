//=============================
// HMWK v0.3
//=============================

// Packages
const express               = require("express"),
    mongoose                = require("mongoose"),
    bodyParser              = require("body-parser"),
    methodOverride          = require("method-override"),
    passport                = require("passport"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    expressSession          = require("express-session"),
    
    LocalStrategy           = require("passport-local"),
    
// Models
    User        = require("./models/user"),
    School      = require("./models/school"),
    Class       = require("./models/class"),

// Routes
    indexRoutes     = require("./routes/index"),
    homeworkRoutes  = require("./routes/homework"),
    authRoutes      = require("./routes/auth"),
    schoolRoutes    = require("./routes/schools"),
    classRoutes     = require("./routes/classes");

// express setup
const app = express();

// mongoose setup
mongoose.connect("mongodb://localhost/hmwk_v0_3");

// ejs setup
app.set("view engine", "ejs");

// passport and session setup
app.use(expressSession({
    secret: 'cookie_secret',
    name: 'cookie_name',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session({
    secret: 'cookie_secret',
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

// ejs Paramenters
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Routes setup
app.use(indexRoutes);
app.use(authRoutes);
app.use("/schools/:school_id/classes/:class_id/homework", homeworkRoutes);
app.use("/schools", schoolRoutes);
app.use("/schools/:school_id/classes", classRoutes);

app.listen("8080", "0.0.0.0", () =>
    console.log("server online")
);