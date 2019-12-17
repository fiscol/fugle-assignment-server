module.exports = function (io) {
    const app = require('express');
    const ws_router = app.Router();
    const socket_service = require('../functional/socket');
    const last_stock_url = 'https://ws-api.iextrading.com/1.0/last';
    const iex_socket = require('socket.io-client')(last_stock_url);

    socket_service._subscribeTest('fb,AAPL');

    io.on('connect', function (socket) {
        socket.emit('message', 'Socket connected.');
    });

    io.of('/last').on('connection', function (socket) {
        socket.on('subscribe', symbols => {
            // Listen to the channel's messages
            iex_socket.on('message', last => {
                socket.send(last);
            })

            // Connect to the channel
            iex_socket.on('connect', () => {
                // Subscribe to topics (i.e. appl,fb,aig+)
                iex_socket.emit('subscribe', symbols)
            })

            // Disconnect from the channel
            iex_socket.on('disconnect', () => console.log('Disconnected.'))
        })

        socket.on('unsubscribe', symbols => {
            iex_socket.emit('unsubscribe', symbols);
            socket.send('unsubscribed!!');
        })
    });

    io.on('close', () => {
        console.log('WebSocket was closed');
    })
    return ws_router;
}