// socket-io-config.js

const socketIo = require('socket.io');

module.exports = (server) => {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('Connected to socket');
  });

  return io;
};
