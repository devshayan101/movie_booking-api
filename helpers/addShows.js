
const { Show } = require('../Models/showModel');



const addShows = (data) =>{
    //take i/p from user of show 
    //save to database data.showTime

    
    const showData = new Show(data).save();

    console.log("showDataSaved:",showData)
    
}

module.exports ={
    addShows
}