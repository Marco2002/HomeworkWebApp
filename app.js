// Main file

// Packages
const express   = require("express"),
    mongoose    = require("mongoose"),

// Models
    Homework = require("./models/homework"),

// Routes
    indexRoutes     = require("./routes/index"),
    homeworkRoutes  = require("./routes/homework");

// express setup
const app = express();

// mongoose setup
mongoose.connect("mongodb://localhost/hmwk_db");

// ejs setup
app.set("view engine", "ejs");

// Routes setup
app.use(indexRoutes);
app.use("/homework", homeworkRoutes);

app.listen(process.env.PORT, process.env.IP, () =>
    console.log("server online")
);