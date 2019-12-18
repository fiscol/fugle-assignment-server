module.exports = function (io) {
    const app = require('express');
    const ws_router = app.Router();
    const socket_service = require('../functional/socket'); // Test from socket-io.client connect
    const symbol_data_service = require('../functional/symbol_data'); // Set return symbol data with IEX last symbol data
    const schedule = require('../functional/schedule'); // Using schedule service to refresh temp-stored IEX symbol data per minute
    const last_stock_url = 'https://ws-api.iextrading.com/1.0/last'; // Doc: https://iextrading.com/developers/docs/#last
    const iex_socket = require('socket.io-client')(last_stock_url); // Get latest IEX symbol data using socket-io.client

    // Refresh temp-stored IEX symbol data every minute
    schedule.refresh_all_symbol_data();
    // Test Websocket Route using socket-io.client
    socket_service._subscribeTest('fb,AAPL', 'room123');

    // Set Websocket route to /ws/last
    io.of('/last').on('connection', function (socket) {
        // Let the client join socket room
        socket.on('join', function (room) {
            socket.join(room, function () {
                io.of('/last').in(room).emit("joined_room", room);
                io.of('/last').to(socket.id).emit("message", socket.id);
            });
        });
        // Subscribe with symbols to receive IEX last and minute data
        socket.on('subscribe', (symbols, room) => {
            // Listen to the channel's messages
            iex_socket.on('message', last_object_str => {
                // Set return symbol data
                io.of('/last').in(room).emit('room_message', JSON.stringify(symbol_data_service._setSymbolData(JSON.parse(last_object_str))));
            })

            // Subscribe to topics (i.e. appl,fb,aig+)
            iex_socket.emit('subscribe', symbols)

            // Disconnect from the channel
            iex_socket.on('disconnect', () => console.log('Disconnected.'))
        })
        // Unsubscribe symbols
        socket.on('unsubscribe', symbols => {
            iex_socket.emit('unsubscribe', symbols);
        })
    });
    // Websocket close event
    io.on('close', () => {
        console.log('WebSocket was closed');
    })
    return ws_router;
}