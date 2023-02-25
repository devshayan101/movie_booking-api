
const { Movie } = require('../Models/movieModel');



const addMovies = (data) =>{
    //take i/p from user of movie, theater and place. 
    //save to database
    //data has data.name, data.place
    
    const movieData = new Movie(data).save();

    console.log("movieDataSaved:",movieData)
    
}

module.exports ={
    addMovies
}