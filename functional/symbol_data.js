/** 
  * Store all subscribed symbol data in 'allSymbolPrices' object.
  * 'allSymbolPrices' data will be cleared with '_refresh_all_symbol_data' function every minute.
  * Format of allSymbolPrices:
  * {
  *     'Some symbol':
  *         {
  *             'time': @param {Number} time Last price data time Ex: 1576702781933
  *             'data': @param {Array} data Every price data of this symbol in this current minute Ex: [202.8, 202.6, 202.5]
  *             'latest': @param {Object} latest The latest minute data of this symbol
  *         }
  * }
  */
let allSymbolPrices = {};

/**
  * @function _setSymbolData Using IEX last data to generate First, Max, Min, Last price data during this minute.
  * @param {Object} last_object IEX last data of a symbol
  * @returns {Object} 
  * Ex: {'FB': 
  *         {'first': 120.34, 'max': 123.20, 'min': 119.55, 'last': 123.20}
  *     }
  */
exports._updateMinuteData = last_object => {
    let minute_data = {};
    let time = last_object['time'];
    let symbol = last_object['symbol'];
    let last_price = last_object['price'];
    minute_data[symbol] = {
        'first': null,
        'max': null,
        'min': null,
        'last': null
    };
    // First record of symbol in this minute, 'allSymbolPrices' not having records yet
    if (!allSymbolPrices.hasOwnProperty(symbol)) {
        allSymbolPrices[symbol] = { 'data': [last_price], 'time': time };
        Object.keys(minute_data[symbol]).forEach(function (key) {
            minute_data[symbol][key] = last_price;
        });
        allSymbolPrices[symbol]['latest'] = minute_data;
        return;
    }
    // 'allSymbolPrices' has symbol record before, compare with history records to create minute data
    allSymbolPrices[symbol]['data'].push(last_price);
    minute_data[symbol]['first'] = allSymbolPrices[symbol]['data'][0];
    minute_data[symbol]['last'] = last_price;
    minute_data[symbol]['max'] = Math.max(...allSymbolPrices[symbol]['data']);
    minute_data[symbol]['min'] = Math.min(...allSymbolPrices[symbol]['data']);
    allSymbolPrices[symbol]['time'] = time;
    allSymbolPrices[symbol]['latest'] = minute_data;
    return;
};

// Get symbols minute data
exports._getMinuteData = symbols => {
    let minute_data = {};
    symbols.split(',').forEach(symbol => {
        if (allSymbolPrices.hasOwnProperty(symbol)) {
            minute_data[symbol] = allSymbolPrices[symbol]['latest'];
        }
        else {
            minute_data[symbol] = {
                'first': null,
                'max': null,
                'min': null,
                'last': null
            };
        }
    })
    return minute_data;
}

// Clear 'allSymbolPrices' symbol data on server
exports._refreshAllSymbolPrices = () => {
    allSymbolPrices = {};
}