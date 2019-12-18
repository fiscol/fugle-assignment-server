const schedule = require('node-schedule'); // Cron job tool for Node.js
const firebase = require('../firebase/firebase_db'); // Firebase related functions
const symbol_data_service = require('./symbol_data'); // Symbol data related service functions

// Scan Firebase to set every counter back to 0 every minute
exports.refresh_counter = function () {
    schedule.scheduleJob({ start: new Date(Date.now()), rule: '*/1 * * * *' }, function () {
        firebase._setCounterToZero('/data/id');
        firebase._setCounterToZero('/data/ip');
    })
};
// Clear all symbol data stored on this server every minute
exports.refresh_all_symbol_data = function () {
    schedule.scheduleJob({ start: new Date(Date.now()), rule: '*/1 * * * *' }, function () {
        symbol_data_service._refresh_all_symbol_data();
    })
};