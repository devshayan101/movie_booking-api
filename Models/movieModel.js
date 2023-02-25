const { Schema, model } = require('mongoose');
//phone number for otp
const movieSchema = new Schema({
    theaterName: {
        type: String,
        required: true
    },
    place:{
        type: String,
        required: true
    },
    movieName:{
        type: String
    },
    shows:{
        type: String
    }
    
}, { timestamps: true });

module.exports.Movie = model('Movie', movieSchema);