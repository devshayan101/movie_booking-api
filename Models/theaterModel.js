const { Schema, model } = require('mongoose');
//phone number for otp
const theaterSchema = new Schema({
    theater: {
        type: String,
        required: true
    },
    place:{
        type: String,
        required: true
    },
    movies:{
        type: String
    },
    shows:{
        type: String
    }
    
}, { timestamps: true });

module.exports.Theater = model('Theater', theaterSchema);