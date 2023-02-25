const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const { resolve } = require('uri-js');
const { string } = require('joi');

const signTempAccessToken = (data) => {
    return new Promise((resolve, reject) =>{
        const payload = {
            name: data.name,
            number: data.number,
            place: data.place,
            userType: data.userType 
        };
        const options = {
            expiresIn: '5m',
            audience: 'NGO',
            subject: `temp-token`
        };
        JWT.sign(payload, process.env.JWT_TEMP_SECRET, options, (err, token) =>{
            if(err){
                reject(createError(500, err));
            }
            else{
                resolve(token);
            }
        })
    });
}

const signAccessToken = (user) => {
    return new Promise((resolve, reject) => {
        const payload = {
            name: user.name,
            number : user.number,
            place: user.place
        };
        const options = {
            expiresIn: '10m', //10mins 
            //issuer: 'https://www.google.com',
            audience: 'NGO',
            subject: `token-generation`
        };
        JWT.sign(payload, process.env.JWT_SECRET_KEY, options, (err, token) => {
            if (err) {
                reject(createError(500, err));
            } else {
                resolve(token);
            }
        });
    })
}

const verifyAccessToken = (req, res, next) => {
    //if authorisation headers not present.
    if (!req.headers['authorization']) return next(createError.Unauthorized()) //donot pass message

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];

    JWT.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
        if (err) {
            if (err.name === 'JsonWebTokenError') return next(createError.Unauthorized())
            else {
                return next(createError.Unauthorized(err.message))
            }
        }
        req.payload = payload;
        next()
    })
}

const signRefreshToken = (user) => {
    return new Promise((resolve, reject) => {
        const payload = {
            name: user.name,
            number: user.number,
            place: user.place
        };
        const options = {
            expiresIn: '1d',
            //issuer: 'https://www.google.com',
            audience: `NGO`
        };
        JWT.sign(payload, process.env.JWT_SECRET_KEY_REFRESH, options, (err, token) => {
            if (err) {
                reject(createError.InternalServerError());
            } else {
                resolve(token);
            }
        });
    })
}

const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        JWT.verify(refreshToken, process.env.JWT_SECRET_KEY_REFRESH, (err, payload) => {
            if (err) return reject(createError.Unauthorized())
            const user = payload //audience of payload
            //blacklist refresh token
            resolve(user)
        })
    })
}

const verifyTempToken = (tempToken) => {
    return new Promise((resolve, reject) => {
        JWT.verify(tempToken, process.env.JWT_TEMP_SECRET, (err, payload) => {
            if (err) return reject(createError.Unauthorized())
            const user = payload//audience of payload
            //blacklist refresh token
            resolve(user)
        })
    })
}

module.exports = {
    signAccessToken,
    verifyAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    signTempAccessToken,
    verifyTempToken
}