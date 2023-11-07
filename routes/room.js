const express = require('express');
const Room = require('../models/room');

const router = express.Router();

// HomePage 
router.get('/', (req, res)=>{
  try {
      res.status(200).json({
          message: `This is the homepage`
      })
  } catch (error){
      res.status(500).json({
          message: `Error connecting to page.`
      })
  }
});


// Create room route
router.post('/createRoom', async (req, res) => {
  const { username } = req.body;

  try {
    // Room is created
    let room = new Room();
    // Player's details
    let player = {
      socketID: req.io.id, // Access the socket ID directly from req.io
      username,
      playerType: 'X',
    };
    // Add player to the room
    room.players.push(player);
    room.turn = player; // Room creator to make the first move
    room = await room.save();

    // Emit a Socket.io event to the client to handle joining the room
    req.io.emit('joinRoom', { roomId: room._id, player });

    // Send an HTTP response with the room data
    return res.status(200).json({ error: 'Room created. Invite a player to join' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Join room route
router.post('/joinRoom', async (req, res) => {
  const { username, roomId } = req.body;

  try {
    // Check if Room ID is valid
    if (!roomId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Please enter a valid room ID' });
    }

    // Check if room is available to join
    if (room.isJoin) {
      let player = {
        username,
        socketID: req.io.id, // Access the socket ID directly from req.io
        playerType: 'O',
      };

// Emit a Socket.io event to the client to handle joining the room
      req.io.emit('joinRoom', { roomId, player });

      room.players.push(player);
      room.isJoin = false;
      room = await room.save();

      req.io.emit('joinRoomSuccess', room);
      req.io.emit('updatePlayers', room.players);
      req.io.emit('updateRoom', room);

      res.status(200).json(room);
    } else {
      return res.status(400).json({ error: 'The game is in progress, try again later' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Listen to tapped grid route
router.post('/tap', async (req, res) => {
  const { index, roomId } = req.body;

  try {
    let room = await Room.findById(roomId); // Find room
    let choice = room.turn.playerType; // X or O

    // Check player's turn
    if (room.turnIndex === 0) {
      // Next player's turn
      room.turn = room.players[1];
      room.turnIndex = 1;
    } else {
      room.turn = room.players[0];
      room.turnIndex = 0;
    }

    room = await room.save(); // Save to DB

    // Emit a Socket.io event to inform clients about the tap
    req.io.emit('tapped', {
      index,
      choice,
      room,
    });

    res.status(200).json({ message: 'Tapped grid successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Check winner route
router.post('/winner', async (req, res) => {
  const { winnerSocketId, roomId } = req.body;

  try {
    let room = await Room.findById(roomId);
    let player = room.players.find((playerr) => playerr.socketID == winnerSocketId);
    player.points += 1;
    room = await room.save();

    if (player.points >= room.maxRounds) {
      req.io.emit('endGame', player);
    } else {
      req.io.emit('pointIncrease', player);
    }

    res.status(200).json({ message: 'Winner checked successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;



