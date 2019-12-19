const fs = require('fs');
const path = require('path');

/** 
  * Store all subscribed symbol data in 'allSymbolPrices' object.
  * 'allSymbolPrices' data will be cleared with '_refreshAllSymbolPrices' function every minute.
  * Format of allSymbolPrices:
  * {
  *     'Symbol ID':
  *         {
  *             'time': @param {Number} time Last price data time Ex: 1576702781933
  *             'data': @param {Array} data Every price data of this symbol in this current minute Ex: [202.8, 202.6, 202.5]
  *             'latest': @param {Object} latest The latest minute data of this symbol Ex: {'first': 120.34, 'max': 123.20, 'min': 119.55, 'last': 123.20}
  *         }
  * }
  */
let allSymbolPrices = {};

/**
  * @function _setSymbolData Using IEX last data to generate First, Max, Min, Last price data during this minute.
  * @param {Object} last_object IEX last data of a symbol
  * Output MinuteData Ex: {'first': 120.34, 'max': 123.20, 'min': 119.55, 'last': 123.20}
  */
exports._updateMinuteData = last_object => {
    let minute_data = {};
    let time = last_object['time'];
    let symbol = last_object['symbol'];
    let last_price = last_object['price'];
    minute_data = {
        'first': null,
        'max': null,
        'min': null,
        'last': null
    };
    // First record of symbol in this minute, 'allSymbolPrices' not having records yet
    if (!allSymbolPrices.hasOwnProperty(symbol)) {
        allSymbolPrices[symbol] = { 'data': [last_price], 'time': time };
        Object.keys(minute_data).forEach(function (key) {
            minute_data[key] = last_price;
        });
        allSymbolPrices[symbol]['latest'] = minute_data;
        return;
    }
    // 'allSymbolPrices' has symbol record before, compare with history records to create minute data
    allSymbolPrices[symbol]['data'].push(last_price);
    minute_data['first'] = allSymbolPrices[symbol]['data'][0];
    minute_data['last'] = last_price;
    minute_data['max'] = Math.max(...allSymbolPrices[symbol]['data']);
    minute_data['min'] = Math.min(...allSymbolPrices[symbol]['data']);
    allSymbolPrices[symbol]['time'] = time;
    allSymbolPrices[symbol]['latest'] = minute_data;
    return;
};

// Get user subscribed symbols minute data
exports._getMinuteData = user_name => {
    return new Promise((resolve, reject) => {
        let file_path = path.resolve(__dirname, '../data/users.json');
        fs.readFile(file_path, 'utf8', (err, data) => {
            let user_data = JSON.parse(data);
            if (!user_data.hasOwnProperty(user_name) || user_data[user_name].length === 0) {
                return resolve('You have not subscribed symbols yet!');
            }
            let symbols = user_data[user_name];
            let minute_data = {};
            symbols.split(',').forEach(symbol => {
                if (allSymbolPrices.hasOwnProperty(symbol)) {
                    minute_data[symbol] = allSymbolPrices[symbol]['latest'];
                }
                // If this symbol is not having new data in this minute, return minute_data with null values
                else {
                    minute_data[symbol] = {
                        'first': null,
                        'max': null,
                        'min': null,
                        'last': null
                    };
                }
            })
            return resolve(minute_data);
        })
    })
}

// Clear 'allSymbolPrices' symbol data on server
exports._refreshAllSymbolPrices = () => {
    allSymbolPrices = {};
}