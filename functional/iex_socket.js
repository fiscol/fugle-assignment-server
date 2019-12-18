module.exports = function (io) {
    const symbol_data_service = require('./symbol_data'); // Set return symbol data with IEX last symbol data
    const last_stock_url = 'https://ws-api.iextrading.com/1.0/last'; //  Local Websocket route
    const socket_cli = require('socket.io-client')(last_stock_url); // Subscribe symbol test using socket-io.client

    // Listen to the channel's messages
    socket_cli.on('message', last_object_str => {
        io.of('/last').to(JSON.parse(last_object_str)['symbol']).emit('room_message', JSON.parse(last_object_str));
        // if (!symbol_data_service._checkSymbolDataExists(JSON.parse(last_object_str))) {
        // Set return symbol data
        symbol_data_service._setSymbolData(JSON.parse(last_object_str));
    })

    // Disconnect from the channel
    socket_cli.on('disconnect', () => console.log('Disconnected.'))

    const functions = {
        _subscribeIEX: function (symbols) {
            // Subscribe to topics (i.e. appl,fb,aig+)
            socket_cli.emit('subscribe', symbols)
        },
        _unsubscribeIEX: function (symbols) {
            // Subscribe to topics (i.e. appl,fb,aig+)
            socket_cli.emit('unsubscribe', symbols)
        }
    }
    return functions;
}