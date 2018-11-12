var express= require("express"),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mingoose"),
    User = require("./models/user");

//apparently http is a stateless protocol. which means that it cant remember what has happened before.
//when authentication comes into play, we will induce states with the help of sessions.


app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost/auth_demo_app");
//Whenever we deal with the post routes we need to install body-parser and app.use body parser as shown below.
app.use(bodyParser.urlencoded({extended: true}));


//Whenever we do authentication just add the below lines of code.! its not like you will lose a kidney by adding it :P 
app.use(require("express-session")({
    secret : "Dikku is an asshole",
    resave :false,
    saveUninitialized : false
}));

//for user login we need to explicitly put the below use statement
app.use(new localStrategy(User.authenticate()));

//whenever we use passport for authentication the below two lines are mandatory to get started.
app.use(passport.initialize());
app.use(passport.session());

//The below lines of code are used to encode and decode the information within sessions. serialize and deserialize are
//functions provided by passport-local-mongoose to make this function happen
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=======================================
// ADD NON-AUTHENTICATION ROUTES BELOW
//=======================================

app.get("/", function(req,res){
    res.render("home");
});

app.get("/secret", isLoggedIn ,function(req, res){
    res.render("secret");
});
//===========================
//ADD AUTH ROUTES BELOW HERE
//===========================

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req,res){
    //in the below code we are creating the user and sending the password separately. Just follow the same procedure.
    User.register(new User({username : req.body.username}), req.body.password , function(err, createdUser){
        //what this code does is that the username is added to the DB. A hash string is created with the password which
        //is then stored in the DB
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secret");
            }); 
        }
    });//After doing this if we go to mongoDB and check we will see that our actual password is not stored in the DB at all.
    //Instead if we do db.users.find() we will be able to see one field called "salt" which im assuming is based on the secret phrase we
    //have provided. We can also see that the Hashed version of the password is stored in the "hash" field. 
    //Even during login whatever password we enter will be converted to a hash string first and then it will be compared to the hash value
    //already stored in the db and only if those two match we will be given access.
    
});

//LOGIN ROUTES
app.get("/login", function(req, res){
    res.render("login.ejs");
});

//for the login post route STFU and follow the below code for authentication. At the most just change the success and failure routes!!!
//passport.authenticate("local", {    successRedirect : "/secret",    failureRedirect: "/login"}) is called middleware and it is executed
//before the callback function gets executed.
app.post("/login", passport.authenticate("local", {
    successRedirect : "/secret",
    failureRedirect: "/login"
}) , function(req,res){

});
//Logout routes
app.get("/logout", function(req, res){
    req.logout(); //this statement will just make sure that the app stops keeping track of the user activity i.e. the session ends
    res.redirect("/");
});
//once logged in we will be able to access the /secret page even after we log out. to avoid this problem we will now write a middleware
//where we will check the status of the session. It takes 3 parameters and it is the standard format.
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){ //isAuthenticated is an inbuilt passport functionality.
        return next();
    }
    res.redirect("/login");
};

//Connect the PORt and start listening to requests
app.listen(3000, function(err){
    if(err){
        console.log(err);
    }else{
        console.log("server is running and the app is listening on port 3000!");
    }
});
