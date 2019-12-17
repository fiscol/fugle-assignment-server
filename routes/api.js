const express = require('express');
const api_router = express.Router();
const fetch = require('node-fetch');
const firebase = require('../firebase/firebase_db');
const schedule = require('../functional/schedule');

schedule.refresh_counter();

api_router.get('/data', function (req, res) {
  let IP = req.ip.split('.').join(',');
  let ID = req.query.user;
  firebase._transactionCount(`/data/ip/${IP}/counter`, 1, function (IP_count) {
    firebase._transactionCount(`/data/id/${ID}/counter`, 1, function (ID_count) {
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

module.exports = api_router;
