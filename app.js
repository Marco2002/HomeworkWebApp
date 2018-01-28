// Main file

// Packages
var express = require("express"),

// Routes
    indexRoutes = require("./routes/index");

// express setup
var app = express();

// ejs setup
app.set("view engine", "ejs");

// Routes setup
app.use(indexRoutes);

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("server online");
});