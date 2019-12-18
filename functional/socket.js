const local_websocket_url = 'http://localhost:3000/last'; //  Local Websocket route
const socket_cli = require('socket.io-client')(local_websocket_url); // Subscribe symbol test using socket-io.client

exports._subscribeTest = function (symbols, room) {
    // Check Websocket connected
    socket_cli.on('connect', function(){
        console.log('[%s]on connect...', socket_cli.id);
    });
    // Join socket room
    socket_cli.emit('join', room);
    // Emit subscribe event after joined room
    socket_cli.on('joined_room', function (room) {
        socket_cli.emit('subscribe', symbols, room);
    });
    // Receive public message data
    socket_cli.on('message', function (message) {
        console.log(message);
    });
    // Receive socket room message data
    socket_cli.on('room_message', function (message) {
        console.log(message);
    });
    // Check Websocket disconnected
    socket_cli.on('disconnect', () => console.log('Disconnected.'))
}