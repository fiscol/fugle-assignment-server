module.exports = function (io) {
    const app = require('express');
    const ws_router = app.Router();
    const socket_service = require('../functional/socket'); // Test from socket-io.client connect
    const data_process = require('../functional/data_process'); // Process user data and subscription
    const symbol_data_service = require('../functional/symbol_data'); // Set symbol minute data
    const schedule = require('../functional/schedule'); // Using schedule service to refresh temp-stored IEX symbol data per minute
    const iex_service = require('../functional/iex_socket')(io); // Handle IEX data related service

    // Refresh temp-stored IEX symbol data every minute
    schedule._refreshAllSymbolData();
    // Test Websocket Route using socket-io.client
    socket_service._subscribeTest('local', 'fb,AAPL');
    // Init data folder user and symbol subscription data
    data_process._initDataFiles();

    // Set Websocket route to /last
    io.of('/last').on('connection', socket => {
        // Subscribe with symbols to receive IEX last data
        socket.on('subscribe', (user_name, symbols) => {
            symbols = symbols.toUpperCase();
            // Check user subscribed symbols total <= 10
            data_process._checkUserSubscribe(user_name, symbols).then(result => {
                if (result) {
                    // Update users and symbols_subscribe data
                    data_process._updateUserAndSubscription(user_name, symbols).then(() => {
                        // Add user to symbols rooms
                        socket.join(symbols.split(','));
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
            symbols = symbols.toUpperCase();
            // Remove user from symbol subscriber
            data_process._handleUnsubscription(user_name, symbols).then(unsubscribe_symbols => {
                // If symbols has no subscriber
                if (unsubscribe_symbols.length > 0) {
                    // Unsubscribe symbols from IEX socket
                    iex_service._unsubscribeIEX(unsubscribe_symbols);
                    // Close symbols room
                    unsubscribe_symbols.forEach(symbol => {
                        io.of('/last').in(symbol).clients((error, socket_ids) => {
                            socket_ids.forEach(socket_id => io.sockets.sockets[socket_id].leave(symbol));
                        });
                    })
                }
            })
        })
        // Get symbols minute data
        socket.on('minute_data', symbols => {
            symbols = symbols.toUpperCase();
            let minute_data = symbol_data_service._getMinuteData(symbols);
            io.of('/last').to(socket.id).emit('message', minute_data);
        })
    });
    // Websocket close event
    io.on('close', () => {
        console.log('WebSocket was closed');
    })
    return ws_router;
}