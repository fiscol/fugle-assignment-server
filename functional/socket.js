const ws_stock_url = 'http://localhost:3000/last';
const socket_cli = require('socket.io-client')(ws_stock_url);

exports._subscribeTest = function (symbols) {
    socket_cli.on('connect', function(){
        console.log('[%s]on connect...', socket_cli.id);
    });
    socket_cli.emit('subscribe', symbols);
    socket_cli.on('message', function (message) {
        console.log(message);
    });
    socket_cli.emit('unsubscribe', 'fb');
    socket_cli.on('disconnect', () => console.log('Disconnected.'))
}