const express = require('express');
const path = require('path');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

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

// Client side DEMO page
app.get('/demo', function (req, res) {
    res.sendFile(path.resolve(__dirname, './examples/socket_cli.html'));
});

http.listen(port, function () {
    console.log('listening on port:' + port);
});

module.exports = app;