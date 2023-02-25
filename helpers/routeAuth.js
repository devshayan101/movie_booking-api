//const cookies = require('cookie-parser');
const createError = require('http-errors');
const JWT = require("jsonwebtoken");

const routeAuth = (req, res, next) =>{
    
    // const cookies = req.cookies;
    // console.log(JSON.stringify(cookies));
    // if(!cookies?.token) throw createError.Unauthorized();
    // const accessToken = cookies.token;
    if(!req.headers.authorization) throw createError.Unauthorized();

    const authHeader = req.headers.authorization;
    if (authHeader) {
    const token = authHeader.split(' ')[1];

    //Access Token from headers

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
}

// export default routeAuth
module.exports = {
    routeAuth
}