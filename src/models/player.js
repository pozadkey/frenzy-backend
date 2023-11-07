const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  // Player's username
  username: {
    type: String,
    trim: true,
  },
  // Player's ID
  socketID: {
    type: String,
  },
  // Player's point earned during the game
  points: {
    type: Number,
    default: 0,
  },
  // Shape being played by player (X or O)
  playerType: {
    required: true,
    type: String,
  },
});

module.exports = playerSchema;
