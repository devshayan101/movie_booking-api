const { addTheaters } = require('../helpers/addTheaters.js');
const { addMovies } = require('../helpers/addMovies.js');

const _ = require('lodash');

const saveTheaterData = (req, res)=>{
    const theaterData = _.pick(req.body, ["theaterName", "place"]);
    addTheaters(theaterData);
}

const saveMoviesData = (req, res)=>{
    const movieData = _.pick(req.body, ["movieName", "place", "theaterName"]);
    addMovies(movieData);
}

module.exports = {
    saveTheaterData,
    saveMoviesData
}