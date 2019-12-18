module.exports = function (io) {
    const app = require('express');
    const ws_router = app.Router();
    const socket_service = require('../functional/socket'); // Test from socket-io.client connect
    const data_process = require('../functional/data_process'); // Process user data and subscription
    const schedule = require('../functional/schedule'); // Using schedule service to refresh temp-stored IEX symbol data per minute
    const iex_service = require('../functional/iex_socket')(io);

    // Refresh temp-stored IEX symbol data every minute
    schedule.refresh_all_symbol_data();
    // Test Websocket Route using socket-io.client
    socket_service._subscribeTest('local', 'fb,AAPL');

    data_process._initDataFiles();

    // Set Websocket route to /last
    io.of('/last').on('connection', function (socket) {
        // Subscribe with symbols to receive IEX last data
        socket.on('subscribe', (user_name, symbols) => {
            // Check user subscribed symbols total <= 10
            data_process._checkUserSubscribe(user_name, symbols).then(result => {
                if (result) {
                    // Update users and symbols_subscribe data
                    data_process._updateUserAndSubscription(user_name, symbols).then(() => {
                        // Add user to symbols rooms
                        socket.join(symbols.toUpperCase().split(','));
                        // Check if symbol subscribed before
                        data_process._checkSymbolSubscibed(symbols).then(new_symbols => {
                            if (new_symbols.length > 0) {
                                iex_service._subscribeIEX(new_symbols);
                            }
                        })
                    })
                }
                else {
                    io.of('/last').to(socket.id).emit('message', 'Your total subscribed symbol exceeds the limit.');
                }
            });
        })
        // Unsubscribe symbols
        socket.on('unsubscribe', (user_name, symbols) => {
            // Remove user from symbol subscriber
            data_process._handleUnsubscription(user_name, symbols).then(unsubscribe_symbols => {
                // If symbols has no subscriber
                if (unsubscribe_symbols.length > 0) {
                    // Unsubscribe symbols from IEX socket
                    iex_service._unsubscribeIEX(unsubscribe_symbols);
                    // Close symbols room
                    unsubscribe_symbols.forEach(symbol => {
                        io.of('/last').in(symbol).clients((error, socketIds) => {
                            socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(symbol));
                        });
                    })
                }
            })
        })
        // Get 
        socket.on('/minute_data', (symbols) => {

        })
    });
    // Websocket close event
    io.on('close', () => {
        console.log('WebSocket was closed');
    })
    return ws_router;
}