const schedule = require('node-schedule'); // Cron job tool for Node.js
const counter = require('./counter'); // Counter function
const symbol_data_service = require('./symbol_data'); // Symbol data related service functions

// Scan 'counter.json' to set every counter back to 0 every minute
exports._refreshCounter = () => {
    schedule.scheduleJob({ start: new Date(Date.now()), rule: '*/1 * * * *' }, () => {
        counter._setCounterToZero();
    })
};
// Clear all symbol data stored on this server every minute
exports._refreshAllSymbolData = () => {
    schedule.scheduleJob({ start: new Date(Date.now()), rule: '*/1 * * * *' }, () => {
        symbol_data_service._refreshAllSymbolPrices();
    })
};