const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({
    title: String,
    subject: String,
    description: String,
    author: String,
});

module.exports = mongoose.model("Homework", homeworkSchema);