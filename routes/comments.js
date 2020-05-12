const express = require('express');
const router = express.Router({mergeParams:true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');

// COMMENTS NEW
router.get("/new", middleware.isLoggedIn, (req,res)=>{
  Campground.findById(req.params.id, (err,foundCampground)=>{
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground:foundCampground});
    }
  });
});
// COMMENTS CREATE
router.post("/", middleware.isLoggedIn, (req,res)=>{
  //lookup campground by id
  Campground.findById(req.params.id, (err,campground)=>{
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      //create new comment
      Comment.create(req.body.comment,(err,comment)=>{
        if(err) {
          req.flash("error", "something went wrong...");
          console.log(err);
        } else {
          //add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //save comment
          comment.save();
          campground.comments.push(comment);
          campground.save();
          req.flash("success", "successfully added comment");
          res.redirect(`/campgrounds/${campground._id}`);
        }
      });
    }
  })
});
//EDIT ROUTE
router.get("/:comment_id/edit",middleware.checkCommentOwnership, (req,res) =>{
  Campground.findById(req.params.id, (err, campground)=>{
    if(err || !campground) {
      req.flash("error", "campground not found");
      return res.redirect("back");
    } else {
      Comment.findById(req.params.comment_id, (err,comment)=>{
        if(err) {
          req.flash("error", "comment not found");
          res.redirect("back");
        } else {
          res.render("comments/edit", {campgroundId:req.params.id, comment:comment});
        }
      });
    }
  });

});
//UPDATE ROUTE
router.put("/:comment_id",middleware.checkCommentOwnership, (req,res)=>{
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, comment)=>{
    if(err) {
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});
//DELETE ROUTE
router.delete("/:comment_id",middleware.checkCommentOwnership, (req,res)=>{
  Comment.findByIdAndRemove(req.params.comment_id , (err)=>{
    if(err) {
      res.redirect("back");
    } else {
      req.flash("success","comment deleted.");
      res.redirect("/campgrounds/"+req.params.id);
    }
  });
});

module.exports = router;
