const express = require('express');
const router = express.Router({mergeParams:true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');
// COMMENTS NEW
router.get("/new", isLoggedIn, (req,res)=>{
  Campground.findById(req.params.id, (err,foundCampground)=>{
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground:foundCampground});
    }
  });
});
// COMMENTS CREATE
router.post("/", isLoggedIn, (req,res)=>{
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
          //add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //save comment
          comment.save();
          campground.comments.push(comment);
          campground.save();
          res.redirect(`/campgrounds/${campground._id}`);
        }
      });
    }
  })
});
//EDIT ROUTE
router.get("/:comment_id/edit",checkCommentOwnership, (req,res) =>{
  Comment.findById(req.params.comment_id, (err,comment)=>{
    if(err) {
      res.redirect("back");
    } else {
      res.render("comments/edit", {campgroundId:req.params.id, comment:comment});
    }
  });
});
//UPDATE ROUTE
router.put("/:comment_id",checkCommentOwnership, (req,res)=>{
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, comment)=>{
    if(err) {
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});
//DELETE ROUTE
router.delete("/:comment_id",checkCommentOwnership, (req,res)=>{
  Comment.findByIdAndRemove(req.params.comment_id , (err)=>{
    if(err) {
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/"+req.params.id);
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

function checkCommentOwnership(req,res,next) {
  // is there a user logged in
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err,comment) =>{
        if(err) {
          res.redirect("back");
        } else {
          //does user own the comment
          if (comment.author.id.equals(req.user._id)) {
            next();
          } else {
            //user doesn't own comment, redirect
            res.redirect("back");
          }
        }
    });
  } else {
    //if not logged in, redirect
    res.redirect("back");
  }
}
module.exports = router;
