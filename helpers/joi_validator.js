const Joi = require('joi');

//to-do add country code input


//signUp-otp generation
const signUpOtpSchema = Joi.object({
    code:Joi.number().required(),
    name: Joi.string().lowercase().pattern(/^[\w\s]*$/).required(),
    number: Joi.number().required(),
    place: Joi.string().lowercase().pattern(/^[a-z ,]+$/).required(),
    userType: Joi.string().lowercase().pattern(/^[\w\s]*$/).required()

});

//signup-otp verification
const signUpOtpVerifySchema = Joi.object({
    
    otp: Joi.string().pattern(/^\d{6}$/).required(), // data and hash must be strings. This cant be number only string for hashing.
    tempToken: Joi.string()
});

//signin-otp generation
const signInOtpSchema = Joi.object({
    code:Joi.number().required(),
    number: Joi.number().required(),

});

//signin-otp verification
const signInOtpVerifySchema = Joi.object({
    otp: Joi.string().pattern(/^\d{6}$/).required(),
    tempToken: Joi.string()

})

module.exports = {
    signUpOtpSchema,
    signUpOtpVerifySchema,
    signInOtpSchema,
    signInOtpVerifySchema
}