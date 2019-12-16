const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const last_stock_url = 'https://ws-api.iextrading.com/1.0/last';
const socket = require('socket.io-client')(last_stock_url);
const firebase_admin = require('firebase-admin');

router.get('/data', function (req, res) {
  
});

router.get('/subscribe', function (req, res) {
  
});

router.get('/unsubscribe', function (req, res) {
  
});

module.exports = router;
