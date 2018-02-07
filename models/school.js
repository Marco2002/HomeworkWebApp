const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
    name: String,
    password: String,
    clases: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class"
        }
    ]
});

module.exports = mongoose.model("School", schoolSchema);