const express = require('express');
const api_router = express.Router();
const fetch = require('node-fetch'); // For retrieving 3rd party async API with steps.
const counter = require('../functional/counter'); // Counter function
const schedule = require('../functional/schedule'); // Using schedule service to refresh 'counter.json' counter

// Init data folder counter data
counter._initDataFiles();
// Set UserID / IP counter in 'counter.json' to 0 every minute
schedule._refreshCounter();

// Set HTTP route to /api/data
api_router.get('/data', (req, res, next) => {
  // Get query parameter user
  let ID = req.query.user;
  if (isNaN(ID) || ID > 1000 || ID < 1) {
    res.status(403).json({ 'Error': 'Your user parameter is invalid.' });
  }
  else{
    next();
  }
}, function (req, res) {
  // Get request IP
  let IP = req.ip;
  // Get query parameter user
  let ID = req.query.user;
  // Add IP / ID counter in 'counter.json' +1
  counter._addCount(IP, ID).then(count_data => {
    // If counter exceeds limit, return error code 403 and request records
    if (count_data.ID > 5 || count_data.IP > 10) {
      let invalid_response_data = { 'IP': count_data.IP, 'ID': count_data.ID };
      res.status(403).json(invalid_response_data);
    }
    else {
      // Request hacker-news Firebase data(datatype: array)
      fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty')
        .then(response => {
          return response.json();
        })
        .catch(error => {
          // Return error code 500 if error happened
          res.status(500).json({ 'Error': error });
        })
        .then(hacker_news_return_data => {
          // Return success code 200 and JSON format result data
          res.status(200).json({ 'result': hacker_news_return_data });
        });
    }
  });
});

module.exports = api_router;
