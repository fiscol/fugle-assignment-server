module.exports = function (io) {
    const symbol_data_service = require('./symbol_data'); // Set symbol minute data
    const last_stock_url = 'https://ws-api.iextrading.com/1.0/last'; // Doc: https://iextrading.com/developers/docs/#last
    const socket_cli = require('socket.io-client')(last_stock_url); // Use websocket service of IEX data using socket-io.client

    // Listen to the channel's messages
    socket_cli.on('message', last_object_str => {
        io.of('/last').to(JSON.parse(last_object_str)['symbol']).emit('subscribe_message', JSON.parse(last_object_str));
        // Update symbol minute data
        symbol_data_service._updateMinuteData(JSON.parse(last_object_str));
    })

    // Disconnect from the channel
    socket_cli.on('disconnect', () => console.log('Disconnected.'))

    const functions = {
        _subscribeIEX: symbols => {
            // Subscribe to topics (i.e. appl,fb,aig+)
            socket_cli.emit('subscribe', symbols);
        },
        _unsubscribeIEX: symbols => {
            // Subscribe to topics (i.e. appl,fb,aig+)
            socket_cli.emit('unsubscribe', symbols);
        }
    }
    return functions;
}