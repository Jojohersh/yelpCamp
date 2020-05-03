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
router.get("/new", (req,res) => {
  res.render("campgrounds/new");
});
//CREATE ROUTE
router.post("/", (req,res) => {
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

module.exports = router;
