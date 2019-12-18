/** 
  * Store all subscribed symbol data in 'allSymbolPrices' object.
  * 'allSymbolPrices' data will be cleared with '_refresh_all_symbol_data' function every minute.
  * Format of allSymbolPrices:
  * {
  *     'Some symbol':
  *         {
  *             'time': @param {Number} time Last price data time
  *             'data': @param {Array} data Every price data of this symbol in this current minute
  *             'latest': @param {Object} latest The latest return data created by this time
  *         }
  * }
  */ 
let allSymbolPrices = {};

/**
  * @function _setSymbolData Using IEX last data to generate First, Max, Min, Last price data during this minute.
  * @param {Object} last_object IEX last data of a symbol
  * @returns {Object} 
  * Ex: {'FB': 
  *         'minute': {'first': 120.34, 'max': 123.20, 'min': 119.55, 'last': 123.20},
  *         'last': {'symbol': 'FB', 'price': 123.20, 'size': 100, 'time': 1576616391726, 'seq': 1543}
  *     }
  */
exports._setSymbolData = function (last_object) {
    let time = last_object['time'];
    let symbol = last_object['symbol'];
    // If temp stored data already has this sequence data record, just return the latest symbolData
    if (allSymbolPrices.hasOwnProperty(symbol) && allSymbolPrices[symbol]['time'] >= time) {
        return allSymbolPrices[symbol]['latest'];
    }
    let symbolData = {};
    let last_price = last_object['price'];
    symbolData[symbol] = {
        'minute': {
            'first': null,
            'max': null,
            'min': null,
            'last': null
        },
        'last': last_object
    };
    // First record of symbol in this minute, temp stored data not having records yet
    if (!allSymbolPrices.hasOwnProperty(symbol)) {
        allSymbolPrices[symbol] = { 'data': [last_price], 'time': time };
        Object.keys(symbolData[symbol]['minute']).forEach(function (key) {
            symbolData[symbol]['minute'][key] = last_price;
        });
        allSymbolPrices[symbol]['latest'] = symbolData;
        return symbolData;
    }
    // Temp stored data has symbol record, compare with history records to create return symbol data
    allSymbolPrices[symbol]['data'].push(last_price);
    symbolData[symbol]['minute']['first'] = allSymbolPrices[symbol]['data'][0];
    symbolData[symbol]['minute']['last'] = last_price;
    symbolData[symbol]['minute']['max'] = Math.max(...allSymbolPrices[symbol]['data']);
    symbolData[symbol]['minute']['min'] = Math.min(...allSymbolPrices[symbol]['data']);
    allSymbolPrices[symbol]['time'] = time;
    allSymbolPrices[symbol]['latest'] = symbolData;
    return symbolData;
};

exports._checkSymbolDataExists = function (last_object) {
    let time = last_object['time'];
    let symbol = last_object['symbol'];
    if (allSymbolPrices.hasOwnProperty(symbol) && allSymbolPrices[symbol]['time'] >= time) {
        return true;
    }
    return false;
}

// Clear temp stored symbol data on server
exports._refresh_all_symbol_data = function () {
    allSymbolPrices = {};
}