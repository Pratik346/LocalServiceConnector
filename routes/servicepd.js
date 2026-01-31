const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {providerSchema}=require("../schema.js");
const Providers = require("../models/servicepvd");
const { isLoggedIn, isProvider,isCreator, isProviderAndHasNoProfile} = require("../middleware");
const multer=require("multer");
const {storage, cloudinary}=require("../cloudConfig.js");
const upload=multer({storage});
const validateProvider=(req,res,next)=>{
    let {error}=providerSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}
router.get("/",async(req,res)=>{
    const allproviders= await Providers.find({status:"approved"});
    res.render("./providers/index.ejs",{allproviders});
});
router.get("/new",isLoggedIn,isProviderAndHasNoProfile,async(req,res)=>{
    res.render("./providers/new.ejs");
});
router.get(
    "/myproviders",
    isLoggedIn,isProvider,
    wrapAsync(async (req, res) => {
      if (req.user.role !== "provider") {
        req.flash("error", "Access denied.");
        return res.redirect("/");
      }
  
      const provider = await Providers.findOne({ creator: req.user._id });
  
      if (!provider) {
        return res.render("providers/registerPrompt");
      }
  
      res.render(`./providers/myproviders`,{provider});
    })
  );
  
router.get("/search",wrapAsync(async(req,res)=>{
    const {q}=req.query;
    const providers=await Providers.find({status:"approved",$or:[{location:{$regex:q,$options:"i"}},{typeofwork:{$regex:q,$options:"i"}}]});
    res.render("providers/searchresults",{providers,q});
}));
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const provider=await Providers.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("creator");
    if(!provider){
        req.flash("error","No such Service Provider!");
        return res.redirect("/providers");
    }
    if(provider.status==="pending"){
        req.flash("error","Service Provider is not added Officially!");
        return res.redirect("/providers");
    }
    res.render("./providers/show.ejs",{provider});
}));
router.post("/",isLoggedIn,isProviderAndHasNoProfile,upload.single("image"),validateProvider,wrapAsync(async(req,res,next)=>{
    if(!req.body || Object.keys(req.body).length===0){
        throw new ExpressError(400,"Send Valid Data");
    }
    let newprovider=new Providers(req.body);
    newprovider.creator=req.user._id;
    if (req.file) {
        newprovider.image = {
          url: req.file.path,
          filename: req.file.filename
        };
      }
    await newprovider.save();
    req.flash("success","Your request is sent to Admin. You will be added after verification.");
    res.redirect("/providers");
}));

router.get("/:id/edit",isLoggedIn,isProvider,isCreator,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const provider=await Providers.findById(id);
    if(!provider){
        req.flash("error","No Such Provider exists");
        return res.redirect("/providers");
    }
    if(provider.status==="pending"){
        req.flash("error","Service Provider is not added Officially!");
        return res.redirect("/providers");
    }
    res.render("./providers/edit.ejs",{provider});
}));
router.put("/:id",isLoggedIn,isProvider,isCreator,upload.single("image"),validateProvider,wrapAsync(async(req,res)=>{
    if(!req.body || Object.keys(req.body).length===0){
        throw new ExpressError(400,"Send Valid Data");
    }
    let {id}=req.params;
    let provider=await Providers.findByIdAndUpdate(id,{...req.body});
    if(req.file){
    await cloudinary.uploader.destroy(provider.image.filename);
    let url=req.file.path;
    let filename=req.file.filename;
    provider.image={url,filename};
    await provider.save();
    }
    req.flash("success","Updated your Details");
    res.redirect(`/providers/${id}`);
}));
router.delete("/:id",isLoggedIn,isProvider,isCreator,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let provider=await Providers.findById(id);
    if(provider.image && provider.image.url){
        await cloudinary.uploader.destroy(provider.image.filename);
    }
    await Providers.findByIdAndDelete(id);
    req.flash("success","Unregisterd Successfully!");
    res.redirect("/providers");
}));
module.exports=router;