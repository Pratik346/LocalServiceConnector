const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./reviews.js");
const serviceSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:{
       url:String,
       filename:String,
    },
    avgprice:{
        type:Number,
        required:true,
        min:100,
    },
    typeofwork:{
        type:String,
        required:true,
    },
    experience:{
        type:Number,
        required:true,
        min:1,
    },
    location:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    contactNumber:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["pending","approved"],
        default:"pending",
    },
    reviews:[
        {
        type:Schema.Types.ObjectId,
        ref:"Review"
    },
],
    creator:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
});
serviceSchema.post("findOneAndDelete",async(provider)=>{
    if(provider){
    await Review.deleteMany({_id:{$in:provider.reviews}});
    }
});
const Provider=mongoose.model("Provider",serviceSchema);
module.exports=Provider;