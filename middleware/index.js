const Campground = require('../models/campground');
const Comment = require('../models/comment');

// all the middleware goes Here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req,res,next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err,campground) =>{
        if(err) {
          res.redirect("back");
        } else {
          //does user own the campground?
          if (campground.author.id.equals(req.user._id)) {
            next();
          } else {
            //otherwise redirect
            res.redirect("back");
          }
        }
    });
  } else {
    //if not, redirect
    res.redirect("back");
  }
}

middlewareObj.checkCommentOwnership = function(req,res,next) {
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

middlewareObj.isLoggedIn = function(req,res,next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

module.exports = middlewareObj;
