const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const last_stock_url = 'https://ws-api.iextrading.com/1.0/last';
const socket = require('socket.io-client')(last_stock_url);
const firebase = require('../firebase/firebase_db');

router.get('/data', function (req, res) {
  let IP = req.ip.split('.').join(',');
  let ID = req.query.user;
  firebase._transactionCount(`/data/ip/${IP}`, 1, function (IP_count) {
    firebase._transactionCount(`/data/id/${ID}`, 1, function (ID_count) {
      if (ID_count > 5 || IP_count > 10) {
        let invalid_response_data = { "IP": IP_count, "ID": ID_count };
        res.status(403).json(invalid_response_data);
      }
      else {
        fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty')
          .then(function (response) {
            return response.json();
          })
          .catch(function (error) {
            res.status(500).send(`Error: ${error}`);
          })
          .then(function (hacker_news_return_data) {
            res.status(200).json({ 'result': hacker_news_return_data });
          });
      }
    });
  });
});

router.get('/subscribe', function (req, res) {
  socket.on('connect', () => {
    socket.emit('subscribe', 'snap');
  });
  socket.on('message', message => res.send(message));
  socket.on('disconnect', () => console.log('Disconnected.'))
});

router.get('/unsubscribe', function (req, res) {
  socket.on('connect', () => {
    socket.emit('unsubscribe', 'snap');
  });
  socket.on('message', message => res.send(message));
  socket.on('disconnect', () => console.log('Disconnected.'))
});

module.exports = router;
