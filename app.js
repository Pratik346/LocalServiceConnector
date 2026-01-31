require("dotenv").config();
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Mongo_Url=process.env.DB_URL;
const path=require("path");
const methodoverride=require("method-override");
const ejsmate=require("ejs-mate");
const servicepvdrouter=require("./routes/servicepd.js");
const reviewrouter=require("./routes/review.js");
const userrouter=require("./routes/user.js");
const adminrouter=require("./routes/admin.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");

main().then(()=>{
    console.log("Connected to Database");
}).catch(err=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(Mongo_Url);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.engine("ejs",ejsmate);
app.use(express.static(path.join(__dirname,"/public")));
const store=MongoStore.create({
    mongoUrl:Mongo_Url,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});
store.on("error",()=>{
    console.log("Error in Mongo Session Store",err);
});
const sessionoption={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        httpOnly:true
    }
}

app.use(session(sessionoption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curruser=req.user;
    next();
});
app.use("/providers",servicepvdrouter);
app.use("/providers/:id/reviews",reviewrouter);
app.use("/users",userrouter);
app.use("/admin",adminrouter);
app.get("/",(req,res)=>{
    res.render("./providers/home.ejs");
});
app.get("/about",(req,res)=>{
    res.render("./info/about.ejs");
});
app.get("/contact",(req,res)=>{
    res.render("./info/contact.ejs");
});
app.get("/services",(req,res)=>{
    res.render("./info/services.ejs");
});
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Some Error Occurred!"}=err;
    res.status(statusCode).render("error.ejs",{statusCode,message});
});
app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});