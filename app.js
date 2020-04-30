const express = require("express");
const app = express();

const mongoose = require("mongoose");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const bodyParser = require('body-parser');

const Campground = require("./models/campground");
const Comment = require('./models/comment');
const User = require('./models/user');
seedDB = require("./seeds");

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/yelp_camp");

app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  next();
});
seedDB();
//passport config
app.use(require("express-session")({
  secret:"Put Your English Words Here Por Favor",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//INDEX ROUTES
app.get("/", (req,res)=>{
  res.render("landing");
});
app.get("/campgrounds", (req,res) => {
  //get all campgrounds from db
  Campground.find({}, (err,allCampgrounds) => {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index",{
        campgrounds: allCampgrounds
      });
    }
  });
});
//NEW ROUTE
app.get("/campgrounds/new", (req,res) => {
  res.render("campgrounds/new");
});
//CREATE ROUTE
app.post("/campgrounds", (req,res) => {
  //get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var newCampground = {name: name, image: image, description: desc};
  // Create a new campground and save to db
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/campgrounds");
    }
  });
  //redirect back to campground page
});
//SHOW - shows more info about one campground
app.get("/campgrounds/:id", (req,res) => {
  // find campground with provided id through Mongoose
  Campground.findById(req.params.id).populate("comments").exec( (err,foundCampground)=>{
    if(err) {
      console.log(err);
    } else {
      console.log(foundCampground);
      // render show template with that campground
      res.render("campgrounds/show",{campground: foundCampground});
    }
  });

});
// ------------------------------------------
// COMMENTS ROUTES
app.get("/campgrounds/:id/comments/new", isLoggedIn, (req,res)=>{
  Campground.findById(req.params.id, (err,foundCampground)=>{
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground:foundCampground});
    }
  });
});

app.post("/campgrounds/:id/comments", isLoggedIn, (req,res)=>{
  //lookup campground by id
  Campground.findById(req.params.id, (err,campground)=>{
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      //create new comment
      Comment.create(req.body.comment,(err,comment)=>{
        if(err) {
          console.log(err);
        } else {
          campground.comments.push(comment);
          campground.save();
          res.redirect(`/campgrounds/${campground._id}`);
        }
      });
    }
  })
});
// ------------------------------------------
// AUTH ROUTES ======================================================
// Show register form
app.get("/register", (req,res)=>{
  res.render("register");
});
//sign up logic
app.post("/register", (req,res)=>{
  var newUser = new User({username:req.body.username});
  User.register(newUser, req.body.password, (err, user)=> {
    if (err) {
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req,res,()=>{
      res.redirect("/campgrounds");
    });
  })
});
//Login screen
app.get("/login", (req,res)=>{
  res.render("login");
});
//login logic
app.post("/login",
         passport.authenticate("local",
          {
            successRedirect:"/campgrounds",
            failureRedirect:"/login"
          }),
          (req,res)=>{
});
//logout route
app.get("/logout", (req,res)=>{
  req.logout();
  res.redirect("/campgrounds");
});

function isLoggedIn(req,res,next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}
//===================================================================

app.listen(3000, () =>{
  console.log("Yelp camp listening on port 3000...");
});
