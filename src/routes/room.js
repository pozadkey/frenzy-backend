// routes/room.js
const Room = require('../models/room');

// Create room
module.exports = (io, socket) => {
    socket.on('createRoom',async ({ username }) => {
        console.log(username);
        try {
            // Room is created
            let room = new Room();
            // Player's details
            let player = {
              socketID: socket.id,
              username,
              playerType: 'X',
            };
            // Add  player to room
            room.players.push(player);
            // Room creator to make the first move
            room.turn = player;
            // Save room to DB
            room = await room.save();
            console.log(room);
            const roomId = room._id.toString();
            socket.join(roomId);
            //  Alert room memebers of successfully created room
            io.to(roomId).emit('createRoomSuccess', room);
          } catch (e) {
            console.log(e);
          }
    });

    // Join room
    socket.on('joinRoom', async ({ username, roomId }) => {
      try {
      // Check if Room ID is valid
        if (!roomId.match(/^[0-9a-fA-F]{24}$/)) {
          socket.emit('errorOccurred', 'Please enter a valid room ID.'); // Show error if not valid
          return;
        }
        let room = await Room.findById(roomId);  // Check DB for room ID
  
        // Check if room is available to join
        if (room.isJoin) {
          let player = {
            username,
            socketID: socket.id,
            playerType: 'O',
          }; 
          socket.join(roomId);
          room.players.push(player);
          room.isJoin = false;
          room = await room.save();
          io.to(roomId).emit('joinRoomSuccess', room); 
          io.to(roomId).emit('updatePlayers', room.players);
          io.to(roomId).emit('updateRoom', room);
        } else {
          // Throw error if room is not available to join
          socket.emit(
          'errorOccurred',
            'The game is in progress, try again later.'
          );
        }
      } catch (e) {
        console.log(e);
      }
    });

    // Listen to tapped grid
    socket.on('tap', async ({ index, roomId }) => {
      try {
        let room = await Room.findById(roomId);  // Find room
        let choice = room.turn.playerType; // X or O
        // Check player's turn
        if (room.turnIndex == 0) {
          // Next player's turn
          room.turn = room.players[1];
          room.turnIndex = 1;
        } else {
          room.turn = room.players[0];
          room.turnIndex = 0;
        }
        room = await room.save(); // Save to  DB
        io.to(roomId).emit('tapped', {
          index,
          choice,
          room,
        });
      } catch (e) {
        console.log(e);
      }
    });

    // Check winner
    socket.on('winner', async ({ winnerSocketId, roomId }) => {
      try {
        let room = await Room.findById(roomId);
        let player = room.players.find(
          (playerr) => playerr.socketID == winnerSocketId
        );
        player.points += 1;
        room = await room.save();
  
        if (player.points >= room.maxRounds) {
          io.to(roomId).emit('endGame', player);
        } else {
          io.to(roomId).emit('pointIncrease', player);
        }
      } catch (e) {
        console.log(e);
      }
    });
};

