const Joi=require("joi");
const { getMaxListeners } = require("./models/reviews");
module.exports. providerSchema=Joi.object({
    name:Joi.string().required(),
    description:Joi.string().required(),
    image:Joi.string().allow("",null),
    avgprice:Joi.number().required().min(0),
    typeofwork:Joi.string().required(),
    experience:Joi.string().required().min(1),
    location:Joi.string().required(),
    email:Joi.string().required(),
    contactNumber:Joi.string().required(),
});
module.exports.reviewSchema=Joi.object({
    rating:Joi.number().required().min(1).max(5),
    comment:Joi.string().required(),
});