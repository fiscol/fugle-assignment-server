module.exports = function (io) {
    const app = require('express');
    const ws_router = app.Router();
    const data_process = require('../functional/data_process'); // Process user data and subscription
    const symbol_data_service = require('../functional/symbol_data'); // Set symbol minute data
    const schedule = require('../functional/schedule'); // Using schedule service to refresh temp-stored IEX symbol data per minute
    const iex_service = require('../functional/iex_socket')(io); // Handle IEX data related service

    // Refresh temp-stored IEX symbol data every minute
    schedule._refreshAllSymbolData();
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
                        data_process._checkSymbolSubscibedIEX(symbols).then(new_symbols => {
                            if (new_symbols.length > 0) {
                                iex_service._subscribeIEX(new_symbols);
                            }
                            io.of('/last').to(socket.id).emit('message', `Your symbols ${symbols} are subscribed!`);
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
            data_process._handleUnsubscription(user_name, symbols).then(no_subscriber_symbols => {
                // If there are symbols has no subscriber
                if (no_subscriber_symbols.length > 0) {
                    // Unsubscribe symbols from IEX socket
                    iex_service._unsubscribeIEX(no_subscriber_symbols);
                    // Close symbols socket room
                    no_subscriber_symbols.split(',').forEach(symbol => {
                        io.of('/last').in(symbol).clients((error, socket_ids) => {
                            socket_ids.forEach(socket_id => io.sockets.sockets[socket_id].leave(symbol));
                        });
                    })
                }
                io.of('/last').to(socket.id).emit('message', `Your symbols ${symbols} are unsubscribed!`);
            })
        })
        // Get user subscribed symbols minute data
        socket.on('minute_data', user_name => {
            symbol_data_service._getMinuteData(user_name).then(minute_data => {
                io.of('/last').to(socket.id).emit('minute_message', minute_data);
            });
        })
    });
    // Websocket close event
    io.on('close', () => {
        console.log('WebSocket was closed');
    })
    return ws_router;
}