# Fugle API Server

This API server is designed for users to receive real-time stock data by requesting with [HTTP/1.1 request](https://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html) and [Websocket](https://developer.mozilla.org/zh-TW/docs/WebSockets/Writing_WebSocket_client_applications) route.

## Getting Started

Follow the instructions below, to make this web server runnable.

### Prerequisites

A [Node.js](https://nodejs.org/) environment is required before installing this server.

You may install Node.js with the latest LTS version on your machine, we used ver.12.3.0 for for our developing / testing.

You can check your Node.js installed version by clicking this command in your terminal:

```
node -v
```
It should return the installed version as reply.

Another related tool is [NPM](https://www.npmjs.com).

NPM is a package manager for Node.js packages. It should also be installed with Node.js installation.

Also, make sure to check it's being successfully installed with command:

```
npm -v
```
If you have installed above tools in your environment, next step will be the server installation.

### Installing

In the terminal environment, using git clone to pull down this project in your targer directory.
```
>> git clone 'https://github.com/fiscol/fugle-assignment-server.git'
```
Thus, you have cloned the project to your local environment.

Next, switch to the project root directory, use 'npm install' to install npm dependencies of this Node.js project.
```
>> npm install
```
Now the server is finished the installation.

It's your time to start the server with command 'npm start'.
```
>> npm start
```
And you should see the server started message just like below shows:
```
> fugle-assignment-server@1.0.0 start /path/fugle_assignment_server
> node ./bin/www
```
Since the server is up, our next step will be interact with its API and Websocket services.


## Web API

API Reference

The Web API is based on REST, returns JSON response, and returns standard HTTP response codes.

The base url for the API is:
* http://yourhostname:port/api

**Get Data API**

This get data API is a HTTP Route **GET** API.

It will return a bunch of symbol inside a JSON object.

| Query parameter | Datatype                            |
| --------------- | ----------------------------------- |
| user            | Number, which is between 1 to 1000. |

HTTP Request example:
* http://yourhostname:port/api/data?user=1

If you are testing in local default environment, use:
* http://localhost:3000/api/data?user=1

**Request rate limit**

| API checks target      | Rate                 |
| ---------------------- | -------------------- |
| User IP                | 10 times per minute. |
| Query parameter 'user' | 5 times per minute.  |

If user exceeded above rules threshold, the response will be a status 403 error with an error JSON data, representing current user total usage count.

Success response (200):
```
{"result":[21835749,21837742,21837772,21834628,21835366,21836184,21836053,21836528,21837477,21830934,21836236,21835990,21831951,21836303,21835516,21832112,21835417,21830065,21834897,21835874,21836364,21823869,21829614,21837823,21835443,21837508,21834889,21835323,21824962,21829831,21835830,21830277,21831395,21827430,21828758,21833718,21830744,21836813,21837414,21828864,21828888,21837095,21836168,21827970,21818518,21834812,21828903,21830699,21831747,21825932,21824161,21824477,21832817,21832253,21830125,21834438,21827682,21825100,21828725,21834631,21815260,21828617,21828120,21828622,21826974,21827844,21834699 ...]}
```
Error response (403):
```
{"IP":6, "ID":6}
```


## Websocket route

We use [socket.io](https://socket.io/docs/) for our WebSocket server.

You can connect to this route and using subscribe to get your [IEX](https://iextrading.com/apps/stocks/) real-time stock data.

For clients to subscribe, use:
* http://yourhostname:port/last
As default, your local route will be:
* http://localhost:3000/last
You might have to replace 'http' with 'ws' while using some socket client tool.

**How to connect**

We have examples for both frontend client-side HTML file and Node.js server side using [socket.io-client](https://socket.io/docs/client-api/) in the 'example' folder of this project.

Or use the client demo page directly:
```
local:
http://localhost:3000/demo
```

HTML Example:
```
// Require socket.io library
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
<script type="text/javascript">
    $(function () {
        // Connect to websocket server
        var socket = io.connect('http://localhost:3000/last');
        socket.on('connect', () => {
            console.log('Connected to server!'));
        });
    });
</script>
```
Node.js server Example:
```
const local_websocket_url = 'http://localhost:3000/last'; //  Local Websocket route
const socket_cli = require('socket.io-client')(local_websocket_url); // Subscribe stock test using socket-io.client

// Check Websocket connected
socket_cli.on('connect', () => {
    console.log('Connected to socket.');
});
```
Belows are the websocket events related to stock data.

**Subscribe**

Subscribe is the core function of this websocket route.

Clients can **select up to 10 stocks per user** with subscribe channel, the **JSON** format [last IEX stock price](https://iextrading.com/developers/docs/#last) will be sent back to clients through 'subscribe_message' channel immediately.

Return example:
```
{"symbol":"AAPL","price":279.65,"size":2,"time":1576786617021,"seq":1763}
```

Parameters:

| Parameter     | Datatype                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| User name     | String                                                                                                               |
| Stock Symbols | String ([symbols](https://iextrading.com/trading/eligible-symbols/) seperates with comma, up to 10 stocks per user.) |

Example:
```
socket.emit('subscribe', 'UserA', 'fb,AAPL,snap');
```
HTML Example:
```
// Emit subscribe event
socket.emit('subscribe', 'UserA', 'snap,fb,AAPL,A,AA,AAAU,AADR');

socket.on('message', message_data => {
    // Subscribe error or Subscribe succeed message data
});

socket.on('subscribe_message', data => {
    // IEX last Stock data
    console.log(JSON.stringify(data));
});
```
Node.js server Example:
```
// Emit subscribe event
socket_cli.emit('subscribe', 'UserB', 'snap,fb,AAPL');

socket_cli.on('message', message_data => {
    // Subscribe error or Subscribe succeed message data
});

socket_cli.on('subscribe_message', data => {
    // IEX last Stock data
    console.log(JSON.stringify(data));
});
```

**Unsubscribe**

Unsubscribe is the channel to cancel subscribed stock data transmission.

Clients can send stock symbols with this 'unsubscribe' channel, the unsubscribed succeed message will be sent back to clients through channel 'message'.

Return example:
```
{"Unsubscribe": "Your symbols 'FB,AAPL' are unsubscribed!"}
```

Parameters:

| Parameter     | Datatype                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------ |
| User name     | String                                                                                     |
| Stock Symbols | String ([symbols](https://iextrading.com/trading/eligible-symbols/) seperates with comma.) |

Example:
```
socket.emit('unsubscribe', 'UserA', 'fb,AAPL');
```
HTML Example:
```
// Emit unsubscribe event
socket.emit('unsubscribe', 'UserA', 'fb,AAPL');

socket.on('message', message_data => {
    // Return unsubscribed message data
});
```
Node.js server Example:
```
// Emit unsubscribe event
socket_cli.emit('subscribe', 'UserB', 'snap,fb,AAPL');

socket_cli.on('message', message_data => {
    // Return unsubscribed message data
});
```

**Get minute data**

Minute data is the trend of specific stock price in this minute, includes indexes like 'max', 'min', 'first', 'last' price data.

Clients can send user name with this 'minute_data' channel, minute data of subscribed stocks by this user will be sent back to clients through channel 'minute_message'.

Minute data format:
```
// New price data exists in this minute
{"SNAP":{"first":15.415,"max":15.415,"min":15.415,"last":15.415}

// Not exists new price data in this minute
{"SNAP":{"first":null,"max":null,"min":null,"last":null}
```
Return example:
```
{"SNAP":{"first":15.415,"max":15.415,"min":15.415,"last":15.415},"FB":{"first":205.525,"max":205.525,"min":205.45,"last":205.51},"AAPL":{"first":280.02,"max":280.06,"min":280.02,"last":280.03},"A":{"first":84.465,"max":84.465,"min":84.445,"last":84.45},"AA":{"first":21.475,"max":21.495,"min":21.475,"last":21.495}}
```

Parameters:

| Parameter | Datatype |
| --------- | -------- |
| User name | String   |

Example:
```
socket.emit('minute_data', 'UserA');
```
HTML Example:
```
setInterval(() => {
    // Emit get minute data event
    socket.emit('minute_data', 'UserA');
}, 5000);

socket.on('minute_message', data => {
    // Receive socket stock minute data
});
```
Node.js server Example:
```
// Emit get minute data event
setInterval(() => {
    socket_cli.emit('minete_data', 'UserB');
}, 10000);

socket_cli.on('minute_message', data => {
    // Receive socket stock minute data
});
```

## Test

We use [mocha](https://mochajs.org) as our dev/testing tool for this module.

And we added [CircleCI service](https://circleci.com/gh/fiscol/fugle-assignment-server) to pre-test this project after every git push events.

You can run all the test with command:
```
>> npm test
```
Or just run with interested test with file path,
testable files listed as below:

| File name            | Detail                                         |
| -------------------- | ---------------------------------------------- |
| test_api.js          | test get data API in routes/api.js             |
| test_websocket.js    | test websocket channels in routes/websocket.js |

For example, you can test with get data api:
```
>> npm test test/test_api.js
```
The output of full npm test should look like this:
```
  listening on port:3000
Socket connection worked...
  #Test HTTP GET data API
    #1 Request with valid ID user=1
      ✓ Should return status 200, with JSON data with 'result' attribute. (714ms)
    #2 Request with invalid ID user=1001
      ✓ Should return status 403, with Error message JSON data.
    #3 Request with same valid ID exceeds rate limit
      ✓ Should return status 403, with invalid count JSON data. (2598ms)
    #4 Request with same IP exceeds rate limit
      ✓ Should return status 403, with invalid count JSON data. (2678ms)

  #Test Websocket route services
    #Subscribe test cases
      #1 Invalid subscribe test
        ✓ Total subscribe exceeds limit error message should be sent back
      #2 Valid subscribe test
        ✓ Subscribe succeed message should be sent back
    #Unsubscribe test cases
      #3 Unsubscribe subscribed symbol test
        ✓ Unsubscribed succeed message should be sent back
    #Get minute data test cases
      #4 Get user subscribed minute data test
        ✓ Minute data should be sent back with valid attributes

Socket disconnecting...
Socket disconnected...

  8 passing (6s)

```

## Built With

* [socket.io](https://socket.io/docs/) - Using socket.io to serve Websocket route.
* [socket.io-client](https://socket.io/docs/client-api/) - Using socket.io-client to receive IEX realtime Websocket client side data.
* [node-fetch](https://www.npmjs.com/package/node-fetch) - For retrieving 3rd party async API with convenience.
* [node-schedule](https://www.npmjs.com/package/node-schedule) - For refreshing related file data per minute with a cron-job format package.
* [async](https://www.npmjs.com/package/async) - Using async series in test case to avoid callback hell happens.

Development use:
* [mocha](https://mochajs.org) - For testing cases in development environment.
* [supertest](https://www.npmjs.com/package/supertest) - To test HTTP API route in development test case.
* [chai](https://www.npmjs.com/package/chai) - Using chai.expect in development test case.


## Versioning

This version is ver.1.0.0.

Based on [SemVer](http://semver.org/) for versioning.

With Node.js using ver.12.13.0 and NPM using ver.6.13.4.

## Author

* **Fiscol Wu** - [GitHub](https://github.com/fiscol)

