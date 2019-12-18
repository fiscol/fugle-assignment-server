/** 
  * Store all subscribed symbol data in 'allSymbolPrices' object.
  * 'allSymbolPrices' data will be cleared with '_refresh_all_symbol_data' function every minute.
  * Format of allSymbolPrices:
  * {
  *     'Some symbol':
  *         {
  *             'seq': @param {Number} seq Last price data sequence ID
  *             'data': @param {Array} data Every price data of this symbol in this current minute
  *             'latest': @param {Object} latest The latest return data created by this seq
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
    let seq = last_object['seq'];
    let symbol = last_object['symbol'];
    // If temp stored data already has this sequence data record, just return the latest symbolData
    if (allSymbolPrices.hasOwnProperty(symbol) && allSymbolPrices[symbol]['seq'] <= seq) {
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
        allSymbolPrices[symbol] = { 'data': [last_price], 'seq': seq };
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
    allSymbolPrices[symbol]['seq'] = seq;
    allSymbolPrices[symbol]['latest'] = symbolData;
    return symbolData;
};

// Clear temp stored symbol data on server
exports._refresh_all_symbol_data = function () {
    allSymbolPrices = {};
}