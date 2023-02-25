const app = require('./app');
require('dotenv/config');
const URI = require('uri-js');
const mongoose = require('mongoose');
 
//{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
//Note:Special characters in mongo url username and password must be encoded, use https://www.urlencoder.org/ for encoding.

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Connected to database');
    })
    .catch((err) => {
        console.log('MongoDB connection failed', err);
    })

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
})