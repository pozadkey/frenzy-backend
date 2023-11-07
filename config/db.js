const mongoose = require("mongoose");
require('dotenv').config();

// Import MongoDB connect Url  
const db = process.env.DB 

// Connect to DB
const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to DB !!");
  } catch (e) {
    console.log(`Unable to connect to DB.. ${e.message}`);
    console.log();
  }
};

module.exports = InitiateMongoServer;