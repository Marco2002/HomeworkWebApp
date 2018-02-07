// Packages
const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({
    title: String,
    subject: String,
    description: String,
    date: String,
});
    
const classSchema = new mongoose.Schema({
    name: String,
    homework: [homeworkSchema]
});

module.exports = mongoose.model("Class", classSchema);