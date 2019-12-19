const local_websocket_url = 'http://localhost:3000/last'; //  Local Websocket route
const socket_cli = require('socket.io-client')(local_websocket_url); // Subscribe symbol test using socket-io.client

exports._subscribeTest = (user_name, symbols) => {
    // Check Websocket connected
    socket_cli.on('connect', () => {
        console.log('[%s]on connect...', socket_cli.id);
    });
    // Emit subscribe event
    socket_cli.emit('subscribe', user_name, symbols);
    // Receive public message data
    socket_cli.on('message', message => {
        console.log(message);
    });
    // Receive socket room message data
    socket_cli.on('room_message', message => {
        console.log(message);
    });
    // Check Websocket disconnected
    socket_cli.on('disconnect', () => console.log('Disconnected.'))
}