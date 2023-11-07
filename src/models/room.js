const mongoose = require("mongoose");
const playerSchema = require("./player");

const roomSchema = new mongoose.Schema({
  // Number of users each room can store
  occupancy: {
    type: Number,
    default: 2,
  },
  // Maximum number of rounds to play
  maxRounds: {
    type: Number,
    default: 5,
  },
  // Active round being played
  currentRound: {
    required: true,
    type: Number,
    default: 1,
  },
  //  Number of players
  players: [playerSchema],
  // Check if the player can join the room
  isJoin: {
    type: Boolean,
    default: true,
  },
  // Check which player's trun  s active
  turn: playerSchema,
  turnIndex: {
    type: Number,
    default: 0,
  },
});

const roomModel = mongoose.model("Room", roomSchema);
module.exports = roomModel;
