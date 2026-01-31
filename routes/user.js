const express=require("express");
const wrapAsync = require("../utils/wrapAsync");
const User=require("../models/user.js");
const passport = require("passport");
const router=express.Router();
router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});
router.post("/signup",wrapAsync(async(req,res)=>{
    try{
    let {username,email,password,role}=req.body;
    if(role==="admin"){
        req.flash("error","Admin cannot register");
        return res.redirect("/providers");
    }
    const newuser=new User({email,username,role});
    await User.register(newuser,password);
    req.login(newuser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to LocalServiceConnector");
        res.redirect("/providers");
    });
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/users/signup");
    }
}));
router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});
router.post("/login",passport.authenticate("local",{failureRedirect:"/users/login",failureFlash:true}),async(req,res)=>{
    req.flash("success","Welcome Back!");
    res.redirect("/providers");
});
router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","LoggedOut Successfully!");
        res.redirect("/");
    })
});
module.exports=router;