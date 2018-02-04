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
    Homework    = require("./models/homework"),
    User        = require("./models/user"),

// Routes
    indexRoutes     = require("./routes/index"),
    homeworkRoutes  = require("./routes/homework"),
    authRoutes      = require("./routes/auth");

// express setup
const app = express();

// mongoose setup
mongoose.connect("mongodb://localhost/hmwk_db_v0_3");

// ejs setup
app.set("view engine", "ejs");

// passport and session setup
app.use(expressSession({
    secret: "express session",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
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
app.use("/homework", homeworkRoutes);

app.listen("8080", "0.0.0.0", () =>
    console.log("server online")
);