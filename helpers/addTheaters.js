
const { Theater } = require('../Models/theaterModel');



const addTheaters = (data) =>{
    //take i/p from user of theater and place. 
    //save to database
    //data has data.name, data.place
    
    const theaterData = new Theater(data).save();

    console.log("theaterDataSaved:",theaterData)
    
}

module.exports ={
    addTheaters
}