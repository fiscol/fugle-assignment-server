const local_websocket_url = 'http://localhost:3000/last'; //  Local Websocket route
const socket_cli = require('socket.io-client')(local_websocket_url); // Subscribe symbol test using socket-io.client

// Check Websocket connected
socket_cli.on('connect', () => {
    console.log('Connected to socket.');
});
// Receive socket system message data
socket_cli.on('message', message_data => {
    console.log(message_data);
});
// Receive socket symbol last data
socket_cli.on('subscribe_message', data => {
    console.log(data);
});
// Receive socket symbol minute data
socket_cli.on('minute_message', data => {
    console.log(data);
});
// Check Websocket disconnected
socket_cli.on('disconnect', () => console.log('Disconnected.'));

let subscribeData = (user_name, symbols) => {
    // Emit subscribe event
    socket_cli.emit('subscribe', user_name, symbols);
}

let unsubscribeData = (user_name, symbols) => {
    // Emit unsubscribe event
    socket.emit('unsubscribe', user_name, symbols);
}

let getMinuteData = (user_name, interval) => {
    // Emit minute data event
    setInterval(() => {
        socket_cli.emit('minete_data', user_name);
    }, interval);
}

/**
 * Call the socket io client methods
 */
// subscribeData('New user', 'fb,AAPL');

// setTimeout(() => {
//     unsubscribeData('New user', 'fb');
// }, 10000);

// getMinuteData('New user', 5000);