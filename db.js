const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGODB_URL_LOCAL;

mongoose.connect(mongoURL,{
   useNewUrlParser: true,
   useUnifiedTopology: true
})

const db = mongoose.connection;

db.on('connected',() => {
    console.log('Connected to MongoDB server');
});

db.on('error',() => {
  console.log('MongoDB connection error',err);
});

db.on('disconnected',() => { 
  console.log('MongoDB disconnected');
  
});

module.exports = db;