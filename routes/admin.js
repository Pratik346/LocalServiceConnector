const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Providers = require("../models/servicepvd");
const { isLoggedIn, isAdmin } = require("../middleware.js");
router.get("/pendingproviders",isLoggedIn,isAdmin,wrapAsync(async(req,res)=>{
    const providers=await Providers.find({status:"pending"});
    res.render("admin/pending.ejs",{providers});
}));
router.post("/providers/:id/approve",isLoggedIn,isAdmin,wrapAsync(async(req,res)=>{
    const provider=await Providers.findById(req.params.id);
    if(!provider || provider.status!=="pending"){
        req.flash("error","Invalid Request!")
        return res.redirect("/admin/pendingproviders");
    }
    provider.status="approved";
    await provider.save();
    req.flash("success","Service Provider is now added Officially");
    res.redirect("/admin/pendingproviders")
}));
router.post("/providers/:id/reject",isLoggedIn,isAdmin,async(req,res)=>{
    const provider=await Providers.findById(req.params.id);
    if(!provider || provider.status!=="pending"){
        req.flash("error","Invalid Request!")
        return res.redirect("/admin/pendingproviders");
    }
    await Providers.findByIdAndDelete(req.params.id);
    req.flash("success","Service Provider is Deleted");
    res.redirect("/admin/pendingproviders");
});
module.exports=router;