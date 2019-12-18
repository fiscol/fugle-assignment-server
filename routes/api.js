const express = require('express');
const api_router = express.Router();
const fetch = require('node-fetch'); // For retrieving 3rd party async API with steps.
const firebase = require('../firebase/firebase_db'); // Firebase related functions
const schedule = require('../functional/schedule'); // Using schedule service to refresh Firebase counter

// Set UserID / IP counter on Firebase to 0 every minute
schedule.refresh_counter();
// Set HTTP route to /api/data
api_router.get('/data', function (req, res) {
  // IP stored on Firebase should transform '.' to other format before stored
  let IP = req.ip.split('.').join(',');
  // Get query parameter user
  let ID = req.query.user;
  // Add IP / ID counter on Firebase +1
  firebase._transactionCount(`/data/ip/${IP}/counter`, 1, function (IP_count) {
    firebase._transactionCount(`/data/id/${ID}/counter`, 1, function (ID_count) {
      // If counter exceeds limit, return error code 403 and request records
      if (ID_count > 5 || IP_count > 10) {
        let invalid_response_data = { "IP": IP_count, "ID": ID_count };
        res.status(403).json(invalid_response_data);
      }
      else {
        // Request hacker-news Firebase data(datatype: array)
        fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty')
          .then(function (response) {
            return response.json();
          })
          .catch(function (error) {
            // Return error code 500 if error happened
            res.status(500).send(`Error: ${error}`);
          })
          .then(function (hacker_news_return_data) {
            // Return success code 200 and JSON format result data
            res.status(200).json({ 'result': hacker_news_return_data });
          });
      }
    });
  });
});

module.exports = api_router;
