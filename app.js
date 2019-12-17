var express = require('express');
var socket_io = require("socket.io");

var app = express();

// Socket.io
var io = socket_io();
app.io = io;

var API_Router = require('./routes/api');
var WebSocket_Router = require('./routes/websocket')(io);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', API_Router);
app.use('/ws', WebSocket_Router);

io.origins('*:*');

module.exports = app;
