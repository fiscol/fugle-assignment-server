var express = require('express');
var socket_io = require('socket.io');

var app = express();

// Socket.io
var io = socket_io();
app.io = io;

// HTTP API Router
var API_Router = require('./routes/api');
// Websocket Router
require('./routes/websocket')(io);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Route
app.use('/api', API_Router);

// Open hostname and port to use Socket connect
io.origins('*:*');

module.exports = app;
