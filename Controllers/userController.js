const bcrypt = require('bcrypt');
const _ = require('lodash');
const otpGenerator = require('otp-generator');
const createError = require('http-errors');
const { User } = require('../Models/userModel');
const { Otp } = require('../Models/otpModel');
const { signUpOtpSchema, signUpOtpVerifySchema, signInOtpSchema, signInOtpVerifySchema } = require('../helpers/joi_validator.js');
const { signAccessToken, signRefreshToken, verifyRefreshToken, signTempAccessToken, verifyTempToken } = require('../helpers/jwt_helper');
const jwt = require('jsonwebtoken');
    


const signUp = async (req, res, next) => {

    try {
        //body validation
        const validationResult = await signUpOtpSchema.validateAsync(req.body);

        console.log(validationResult);
        const number = `${validationResult.code}${validationResult.number}`;
        console.log('number:',number);
        const user = await User.findOne({ number: number });
        console.log("user:",user);

        if (user) {
            throw createError.Conflict(`${number} is already registered.`);
            //redirect to user sign-in route
        }

        const OTP = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        //Note: otp generator generates 6 digit 'string' values.

        console.log(OTP);
        //schema only saves number and otp


        const otp = new Otp({
            number: number,
            name: validationResult.name,
            place: validationResult.place,
            otp: OTP
        });
        const salt = await bcrypt.genSalt(10);
        otp.otp = await bcrypt.hash(otp.otp, salt);
        const result = await otp.save();
        console.log(result);


        console.log("userType:", validationResult.userType)


        const data = {
            number: number,
            name: validationResult.name,
            place: validationResult.place,
            userType: validationResult.userType
        }

        const tempToken = await signTempAccessToken(data);

        res.cookie('tempToken', tempToken, {httpOnly: true, sameSite: 'None', maxAge: 5*60*1000});
        

        return res.status(200).json({ "message": "Otp sent successfully", 
                                      "result": result,
                                      "tempToken": tempToken,
                                       data 
                                    });
        //remove result from response
    }
    catch (error) {
        if (error.isJoi === true) error.status = 422;
        next(error);
    }
};

//Below for user registration verification.
const signUp_verifyOtp = async (req, res, next) => {
    try {
        // const cookies = req.cookies;
        // const tempToken = cookies.temptoken;
        const tempToken = req.body.tempToken;
        console.log("tempToken:", tempToken);
        const decoded = await verifyTempToken(tempToken);

        let otpValidationResult = await signUpOtpVerifySchema.validateAsync(req.body);
        console.log('otpValidationResult:', otpValidationResult);

        const otpHolder = await Otp.find({ number: decoded.number });
        if (otpHolder.length === 0) {
            return res.status(400).json({ message: 'OTP not generated' });
        }
        const rightOtpFind = otpHolder[otpHolder.length - 1];
        console.log('rightOtpFind:', rightOtpFind);
        const validUser = await bcrypt.compare(otpValidationResult.otp, rightOtpFind.otp);
        console.log('validUser:', validUser);

        if (rightOtpFind.number == decoded.number && validUser) {
            let user = _.pick(decoded, ["number", "name", "place", "userType"]);
            console.log('user:', user);
            const accessToken = await signAccessToken(user);
            const refreshToken = await signRefreshToken(user);

            user = new User(user);
            const result = await user.save();

            const OTPDelete = await Otp.deleteMany({
                number: rightOtpFind.number
            });

            //cear temp-token generated previously
            res.clearCookie('tempToken');

            res.setHeader('Authorization', 'Bearer '+ accessToken);    // set access-token in header
            // save refresh token in cookie with httpsOnly property.
            res.cookie('accessToken', accessToken, {httpOnly: true, sameSite: 'None', maxAge: 10*60*1000});
            res.cookie('refreshToken', refreshToken, {httpOnly: true, sameSite: 'None', maxAge: 24*60*60*1000});

            return res.status(200).json({
                message: "User Registration Successfull!",
                token: accessToken,
                refreshToken: refreshToken,
                user
            });
        } else {
            const error = new Error("Wrong OTP Entered");
            error.status = 400;
            next(error);
        }
    }
    catch (error) {
        if (error.isJoi === true) error.status = 422;
        next(error);
    }
};
//checking wether user exists or not.
//otp generation and sending otp to user's mobile number.

//Make sure your middleware is ordered properly, and if you're using Postman 
// setting the "Content-Type" header to "application/json" might help.

//If testing the API using POSTMAN, ensure that 'Content-Length' header is active and set to <calculated when request is sent>.

const signIn = async (req, res, next) => {
    //check if user is already loggedin or not. 

    try {
        const validationResult = await signInOtpSchema.validateAsync(req.body);
        const number = `${validationResult.code}${validationResult.number}`;

        
        const user = await User.findOne({ number: number });
        console.log(user);
        if (user==null) { 
            throw createError.NotFound('User does not exist, kindly register.');
        }

        const OTP = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        console.log(OTP);


        //here send OTP through messaging system. 

        const otp = new Otp({
            number: number,
            otp: OTP
        });

        const salt = await bcrypt.genSalt(10);
        otp.otp = await bcrypt.hash(otp.otp, salt);
        const result = await otp.save();
        console.log(result);

        const data = {
            number: number,
        }
        const tempToken = await signTempAccessToken(data);
        res.cookie('tempToken', tempToken, {httpOnly: true,sameSite: 'None', secure:true, maxAge: 5*60*1000});

        //temp token is used to store data securely and pass to next page. 

        return res.status(200).json({ message: "Otp sent successfully ", tempToken: tempToken });

    }
    catch (error) {

        if (error.isJoi === true) error.status = 422; //validation error
        next(error);
    }
};

//verifying otp and login.
const signIn_verifyOtp = async (req, res, next) => {
    try {
        // const cookies = req.cookies;
        // const tempToken = cookies.tempToken;

        const tempToken = req.body.tempToken;
        console.log("tempToken:", tempToken);
        const decoded = await verifyTempToken(tempToken);

        const validationResult = await signInOtpVerifySchema.validateAsync(req.body);

        const otpHolder = await Otp.find({ number: decoded.number });

            if (otpHolder.length === 0) {
                throw createError.NotFound('OTP not generated');
                //return res.status(400).send('Invalid OTP');
            }

        const rightOtpFind = otpHolder[otpHolder.length - 1];

        console.log("rightOtpFind:",rightOtpFind);

        const validUser = await bcrypt.compare(validationResult.otp, rightOtpFind.otp);


        console.log("validUser:",validUser);
        console.log("rightOtpFind.number:",rightOtpFind.number);
        console.log("decoded.number:",decoded.number);

        if (rightOtpFind.number == decoded.number && validUser) {

            // jwt_verify here

            //fetch 'name' from 'number' from database
            const userData = await User.findOne({number: decoded.number});
            console.log('userData:', userData);
            let user = _.pick(userData, ['number', 'name', 'place', 'userType']);
            // user = JSON.stringify(user);
            //added name, number and place to access-token. 
            console.log('user:', user);
            


            const accessToken = await signAccessToken(user);
            const refreshToken = await signRefreshToken(user);
            //const result = await user.save(); //data for logged in user//change collection name
            await Otp.deleteMany({
                number: rightOtpFind.number
            });
            res.setHeader('Authorization', 'Bearer '+ accessToken);    // set access-token in header
            res.cookie('accessToken', accessToken, {httpOnly: true, sameSite: 'None', secure:true, maxAge: 10*60*1000}); 
            res.cookie('refreshToken', refreshToken, {httpOnly: true, sameSite: 'None', secure:true, maxAge: 24*60*60*1000});

            return res.status(200).json({
                message: "login Successfull!",
                accessToken,
                user,
                
            });
        } else {
            return res.status(400).json({ message: "Your OTP is wrong!" })
        }
    }
    catch (error) {
        if (error.isJoi === true) error.status = 422; //validation error
        next(error);
    }

}

const refresh = async (req, res, next) => {
    try {
        
        const cookies = req.cookies;
        const refreshToken = cookies.refreshToken;
        if (!refreshToken) throw createError.BadRequest();
        const user = await verifyRefreshToken(refreshToken); //resolves user

        const accessToken = await signAccessToken(user);
        // const refToken = await signRefreshToken(user); //no new refresh token generation

        //clear expired access-token
        res.clearCookie('accessToken');

        //save new access-token generated        
        res.cookie('accessToken', accessToken, {httpOnly: true, sameSite: 'None',secure:true, maxAge: 10*60*1000});
        
        res.json({ accessToken: accessToken, refreshToken: refreshToken });
    } catch (error) {
        next(error)
    }
}

const logout = async(req, res, next) =>{
    //check if accessToken & refreshToken cookies are present.
    //if not give message: already loggedout.
    const cookies = req.cookies;
    const accessToken = cookies.accessToken;
    const refreshToken = cookies.refreshToken;

    if(!accessToken && !refreshToken){
        res.json({message:"Already Logged-out."})
        return
    }
    res.clearCookie('accessToken', {httpOnly: true, sameSite: 'None',secure:true, maxAge: 10*60*1000});
    res.clearCookie('refreshToken', {httpOnly: true, sameSite: 'None',secure:true, maxAge: 10*60*1000});

    res.json({message: "Logout successful."})
}

module.exports = {
    signUp,
    signUp_verifyOtp,
    signIn,
    signIn_verifyOtp,
    refresh,
    logout
}