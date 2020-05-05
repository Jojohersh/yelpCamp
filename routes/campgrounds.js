var express = require('express');
var router = express.Router();
const Campground = require('../models/campground');
//INDEX ROUTE
router.get("/", (req,res) => {
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
router.get("/new",isLoggedIn, (req,res) => {
  res.render("campgrounds/new");
});

//CREATE ROUTE
router.post("/",isLoggedIn, (req,res) => {
  //get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newCampground = {name: name, image: image, description: desc, author:author};
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

//SHOW ROUTE
router.get("/:id", (req,res) => {
  // find campground with provided id through Mongoose
  Campground.findById(req.params.id).populate("comments").exec( (err,foundCampground)=>{
    if(err) {
      console.log(err);
    } else {
      // render show template with that campground
      res.render("campgrounds/show",{campground: foundCampground});
    }
  });
});

// EDIT ROUTE
router.get("/:id/edit", (req,res)=>{
  //is user logged in?
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err,campground) =>{
        if(err) {
          console.log(err);
          res.redirect("/campgrounds");
        } else {
          //does user own the campground?
          if (campground.author.id.equals(req.user._id)) {
            res.render("../views/campgrounds/edit", {campground: campground});
          } else {
          //otherwise redirect
          res.send("You do not have permission to do that");
          }
        }
    });
  } else {
    //if not, redirect
    console.log("YOU NEED TO BE LOGGED IN TO DO THAT");
    res.send("YOU NEED TO BE LOGGED IN TO DO THAT");
  }



  // res.send("EDIT CAMPGROUND ROUTE");
});
// UPDATE ROUTE
router.put("/:id", (req,res)=>{
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err,campground)=> {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/"+req.params.id);
    }
  });
});
// DESTROY ROUTE
router.delete("/:id", (req,res)=>{
  Campground.findByIdAndRemove(req.params.id, (err)=>{
    if(err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds");
    }
  });
});

//MIDDLEWARE
function isLoggedIn(req,res,next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
