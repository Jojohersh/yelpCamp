const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require('body-parser');

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//schema setup
var campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//   {
//     name: "Camp Aurora",
//     image: "https://cdn.pixabay.com/photo/2016/02/09/16/35/night-1189929_960_720.jpg",
//     description: "Roast marshmallows, play the guitar, brave the fury of mother nature, all under the ominous green of the Aurora Borrealis"
//   }, (err, campground) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("Newly created campground:");
//       console.log(campground);
//     }
//   }
// );

app.get("/", (req,res)=>{
  res.render("landing");
});
app.get("/campgrounds", (req,res) => {
  //get all campgrounds from db
  Campground.find({}, (err,allCampgrounds) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index",{campgrounds: allCampgrounds});
    }
  });
});
app.get("/campgrounds/new", (req,res) => {
  res.render("new");
});
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
  Campground.findById(req.params.id ,(err,foundCampground)=>{
    if(err) {
      console.log(err);
    } else {
      // render show template with that campground
      res.render("show",{campground: foundCampground});
    }
  });

});

app.listen(3000, () =>{
  console.log("Yelp camp listening on port 3000...");
});
