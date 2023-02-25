const { Schema, model } = require('mongoose');

module.exports.Otp = model('Otp', new Schema({
    number: {
        type: Number,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    tempToken: {
        type: String
    },
    createdAt: { type: Date, default: Date.now, index: { expires: 300 } }
    //After 5 minutes, the otp will be expired and hence deleted from the database.
}, { timestamps: true }));