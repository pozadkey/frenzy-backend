const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIoConfig = require('./config/socket-io-config');
const routes = require('./routes');
require('dotenv').config();

// Start express
const app = express();

// enable cors
app.use(cors());

//Port
const port = process.env.PORT || 5000;

// Create server
const server = http.createServer(app);

const io = socketIoConfig(server);

// Import Room model
const Room = require('./models/room');

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// Routes
app.use(routes, (req, res, next) => {
    req.io = io; // Pass the `io` object to the route
    routes(req, res, next);
  });

  app.use(routes)

//Import DB config
const InitiateMongoServer = require("./config/db");

// Initiate MongoDB 
InitiateMongoServer();

// Connect to socket
io.on('connection', (socket) => {
    console.log('Connected to socket');
    roomRoutes(io, socket);
});

// Start server
const startServer = () => {
    server.listen(port, (error)=>{
        if (error) throw error.message;
        console.log(`Server is running on port ${port}.`);
    })
}

startServer();


