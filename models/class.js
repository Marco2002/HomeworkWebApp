// Packages
const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
    title: String,
    subject: String,
    subjectName: String,
    topics: [
        {
            topic: String,
            learn: String,
        }
    ],
    date: String
});

const homeworkSchema = new mongoose.Schema({
    title: String,
    subject: String,
    subjectName: String,
    description: String,
    date: String,
});
    
const classSchema = new mongoose.Schema({
    name: String,
    homework: [homeworkSchema],
    exams: [examSchema]
});

module.exports = mongoose.model("Class", classSchema);