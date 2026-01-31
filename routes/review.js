const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {reviewSchema}=require("../schema.js");
const Review= require("../models/reviews.js");
const Providers= require("../models/servicepvd.js");
const {isLoggedIn,isAuthor}=require("../middleware.js");
const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}
router.post("/",isLoggedIn,validateReview,wrapAsync(async(req,res)=>{
    let provider=await Providers.findById(req.params.id);
    if(provider.status==="pending"){
        req.flash("error","The Current Service Provider is not added Officially!");
        return res.redirect("/providers");
    }
    let newreview=new Review(req.body);
    newreview.author=req.user._id;
    provider.reviews.push(newreview);
    await newreview.save();
    await provider.save();
    req.flash("success","Added Review");
    res.redirect(`/providers/${req.params.id}`);
}));
router.delete("/:reviewid",isLoggedIn,isAuthor,wrapAsync(async(req,res)=>{
    let {id,reviewid}=req.params;
    await Providers.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    req.flash("success","Deleted Review");
    res.redirect(`/providers/${id}`);
}));
module.exports=router;