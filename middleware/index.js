const Campground = require('../models/campground');
const Comment = require('../models/comment');

// all the middleware goes Here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req,res,next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err,campground) =>{
        if(err || !campground) {
          req.flash("error", "Campground not found");
          res.redirect("back");
        } else {
          //does user own the campground?
          if (campground.author.id.equals(req.user._id)) {
            next();
          } else {
            //otherwise redirect
            req.flash("error", "You don't have permission to do that.");
            res.redirect("back");
          }
        }
    });
  } else {
    //if not, redirect
    req.flash("error","You need to be logged in to do that.");
    res.redirect("back");
  }
}

middlewareObj.checkCommentOwnership = function(req,res,next) {
  // is there a user logged in
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err,comment) =>{
        if(err || !comment) {
          req.flash("error", "Comment not found");
          res.redirect("back");
        } else {
          //does user own the comment
          if (comment.author.id.equals(req.user._id)) {
            next();
          } else {
            //user doesn't own comment, redirect
            req.flash("error", "You do not have permission to do that.");
            res.redirect("back");
          }
        }
    });
  } else {
    //if not logged in, redirect
    req.flash("error", "You must be logged in.");
    res.redirect("back");
  }
}

middlewareObj.isLoggedIn = function(req,res,next) {
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error", "You must be logged in to do that.");
  res.redirect("/login");
}

module.exports = middlewareObj;
