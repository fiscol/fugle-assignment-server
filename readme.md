# Fugle API Server

This API server is designed for users to receive real-time stock data by requesting with [HTTP/1.1 request](https://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html) and [Websocket](https://developer.mozilla.org/zh-TW/docs/WebSockets/Writing_WebSocket_client_applications) API route.

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

Another related tool is [NPM](https://www.npmjs.com). NPM is a package manager for Node.js packages. It should also be installed with Node.js installation.

Also, make sure to check it's being successfully installed with command:

```
npm -v
```

### Installing

## Web API

**Test**

## Websocket API

**Test**

## Built With

* [firebase-admin](https://firebase.google.com/docs/admin/setup?authuser=0) - Using Firebase to save user and IEX symbols data.
* [socket.io](https://socket.io/docs/) - Using socket.io to serve Websocket route.
* [socket.io-client](https://socket.io/docs/client-api/) - Using socket.io-client to receive IEX realtime Websocket client side data.
* [node-fetch](https://www.npmjs.com/package/node-fetch) - For retrieving 3rd party async API with convenience.
* [node-schedule](https://www.npmjs.com/package/node-schedule) - For refreshing Firebase DB request  counter per minute with a cron-job format package.
* [mocha](https://mochajs.org) - For testing cases in developing environment.


## Versioning

This version is ver.1.0.0.
Based on [SemVer](http://semver.org/) for versioning.

With Node.js using ver.12.13.0 and NPM using ver.6.13.4.

## Author

* **Fiscol Wu** - [GitHub](https://github.com/fiscol)

