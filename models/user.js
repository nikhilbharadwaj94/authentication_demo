var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

//Create the User with username and password
var userSchema = new mongoose.Schema({
    username : String,
    password : String
});


//The below line will add a lot of functionalities and methopds to the userSchema related to authentication
userSchema.plugin(passportLocalMongoose);
//module.exports is like a return statement
module.exports = mongoose.model("User", userSchema);
