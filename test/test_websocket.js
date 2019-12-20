const expect = require('chai').expect;
const ioClient = require('socket.io-client');
const app = require('../app');
const data_process = require('../functional/data_process'); // Process user data and subscription
process.env['PORT'] = 3000;
process.env['VERBOSE'] = true;

let socket_cli;

before(function (done) {
    // Init data folder user and symbol subscription data before tests
    data_process._initDataFiles();
    // Setup websocket connection
    socket_cli = ioClient.connect(`http://localhost:${process.env['PORT']}/last`, {
        transports: ['websocket'],
        'force new connection': true
    });
    socket_cli.on('connect', function () {
        console.log('Socket connection worked...');
        done();
    });
    socket_cli.on('disconnect', function () {
        console.log('Socket disconnected...');
    })
});

after(function (done) {
    // Re-initialize data folder user and symbol subscription data after tests
    data_process._initDataFiles();
    // Cleanup, disconnect websocket and close websocket
    if (socket_cli.connected) {
        console.log('Socket disconnecting...');
        socket_cli.disconnect();
        socket_cli.on('disconnect', () => console.log('Socket disconnected.'));
        app.io.close();
        done();
    } else {
        console.log('No socket connection to break...');
        done();
    }
});

// Begin test routes/websocket.js
describe('#Test Websocket route services', () => {
    describe('#Subscribe test cases', () => {
        describe('#1 Invalid subscribe test', function () {
            this.timeout(10000);
            it(`Total subscribe exceeds limit error message should be sent back`, done => {
                socket_cli.emit('subscribe', 'user1', 'fb,snap,AAPL,A,AA,AAAU,AADR,ACH,ACIA,ACIO,ACIU');
                socket_cli.on('message', message_data => {
                    if (message_data.Error) {
                        expect(message_data.Error).to.be.equal('Your total subscribed symbol exceeds the limit.');
                        return done();
                    }
                });
            });
        });
        describe('#2 Valid subscribe test', function () {
            this.timeout(10000);
            it(`Total subscribe exceeds limit error message should be sent back`, done => {
                socket_cli.emit('subscribe', 'user1', 'fb,snap');
                socket_cli.on('message', message_data => {
                    if (message_data.Subscribe) {
                        expect(message_data.Subscribe).to.be.equal('Your symbols FB,SNAP are subscribed!');
                        return done();
                    }
                });
            });
        });
    });
    describe('#Unsubscribe test cases', () => {
        describe('#3 Unsubscribe subscribed symbol test', function () {
            this.timeout(10000);
            it(`Unsubscribed succeed message should be sent back`, done => {
                socket_cli.emit('unsubscribe', 'user1', 'snap');
                socket_cli.on('message', message_data => {
                    if (message_data.Unsubscribe) {
                        expect(message_data.Unsubscribe).to.be.equal('Your symbols SNAP are unsubscribed!');
                        return done();
                    }
                });
            });
        });
    });
    describe('#Get minute data test cases', () => {
        describe('#4 Get user subscribed minute data test', function () {
            this.timeout(10000);
            it(`Minute data should be sent back with valid attributes`, done => {
                socket_cli.emit('minute_data', 'user1');
                socket_cli.on('minute_message', data => {
                    expect(data.hasOwnProperty('FB')).to.be.equal(true);
                    if (data.FB) {
                        let minute_data_attributes = Object.keys(data.FB);
                        expect(minute_data_attributes.includes('first')).to.be.equal(true);
                        expect(minute_data_attributes.includes('max')).to.be.equal(true);
                        expect(minute_data_attributes.includes('min')).to.be.equal(true);
                        expect(minute_data_attributes.includes('last')).to.be.equal(true);
                        return done();
                    }
                });
            });
        });
    });
});
