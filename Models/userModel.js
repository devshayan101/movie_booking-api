const { Schema, model } = require('mongoose');
//phone number for otp
const userSchema = new Schema({
    number: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    userType:{
        type: String
    },
    place: {
        type: String
    }
}, { timestamps: true });

module.exports.User = model('User', userSchema);