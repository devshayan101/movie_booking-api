const { Schema, model } = require('mongoose');
//phone number for otp
const showSchema = new Schema({
    theaterName: {
        type: String,
    },
    place:{
        type: String,
        required: true
    },
    movieName:{
        type: String
    },
    showTime:{
        type: String
    }
    
}, { timestamps: true });

module.exports.Show = model('Show', showSchema);