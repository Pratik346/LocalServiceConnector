const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");
const userSchema=new Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    role:{
        type:String,
        enum:["user","provider","admin"],
        default:"user",
    },
});
userSchema.index(
    { role: 1 },
    { unique: true, partialFilterExpression: { role: "admin" } }
  );
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);