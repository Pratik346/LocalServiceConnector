const providers=require("./models/servicepvd");
const reviews=require("./models/reviews");
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error","Please Login/Signup");
      return res.redirect("/users/signup");
    }
    next();
  };
  module.exports.isProvider = (req, res, next) => {
    if (req.user.role==="user"){
      req.flash("error","Only Admin and Service Provider can access this page");
      return res.redirect("/providers");
    }
    next();
  };
  module.exports.isCreator=async (req,res,next)=>{
    let {id}=req.params;
    let provider=await providers.findById(id);
    if(provider.creator.equals(res.locals.curruser._id) || res.locals.curruser.role==="admin"){
      next();
    }else{
      req.flash("error","Only Admin and Creator can edit/delete");
      return res.redirect(`/providers/${id}`);
    }
    
  }
  module.exports.isAuthor=async(req,res,next)=>{
    let {id,reviewid}=req.params;
    let review=await reviews.findById(reviewid);
    if(review.author.equals(res.locals.curruser._id) || res.locals.curruser.role==="admin"){
      next();
    }else{
      req.flash("error","Only Admin and Author can delete");
      return res.redirect(`/providers/${id}`);
    }
    
  }
  module.exports.isAdmin=(req,res,next)=>{
    if(req.user.role!=="admin"){
      req.flash("error","Access Denied! Only Admin can access");
      return res.redirect("/providers");
    }
    next();
  }

module.exports.isProviderAndHasNoProfile = async (req, res, next) => {
  if (req.user.role !== "provider") {
    req.flash("error", "Access denied.");
    return res.redirect("/");
  }
  const existingProvider = await providers.findOne({ creator: req.user._id });

  if (existingProvider) {
    req.flash("error", "You can register only one service provider profile.");
    return res.redirect(`/providers/${existingProvider._id}`);
  }

  next();
};

  