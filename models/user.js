var mongoose              = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    passward: String,
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School"
    },
    clas: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);