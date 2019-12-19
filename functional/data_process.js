const fs = require('fs');
const path = require('path');
/**
  * @function _initDataFiles Clear 'users.json' and 'symbols_subscribe.json' in 'data' folder when socket io start service
  */
exports._initDataFiles = () => {
    return new Promise((resolve, reject) => {
        let user_file = path.resolve(__dirname, '../data/users.json');
        let symbol_subscribe_file = path.resolve(__dirname, '../data/symbols_subscribe.json');
        // Files will be reset to an empty curly brackets {}
        fs.writeFile(user_file, JSON.stringify({}), () => {
            fs.writeFile(symbol_subscribe_file, JSON.stringify({}), () => {
                return resolve('Data files refreshed!');
            })
        })
    })
}

/**
  * @function _checkUserSubscribe Check user total subscribed symbols count is within the threshold (Max: 10)
  * @returns {Boolean} Total subscriptions count is valid or invalid
  */
exports._checkUserSubscribe = (user_name, symbols) => {
    return new Promise((resolve, reject) => {
        let user_file = path.resolve(__dirname, '../data/users.json');
        fs.readFile(user_file, 'utf8', (err, data) => {
            let user_data = JSON.parse(data);
            // Check subscribed symbols in 'users.json' and new subscriptions total count
            let subscribed_total = 0;
            if (!user_data.hasOwnProperty(user_name)) {
                subscribed_total = symbols.split(',').length;
                return resolve(subscribed_total <= 10);
            }
            subscribed_total = user_data[user_name].split(',').length + symbols.split(',').length;
            // Remove total count of repeat subscriptions
            let subscribed_symbol_array = user_data[user_name].split(',');
            let new_symbol_array = symbols.split(',');
            new_symbol_array.forEach(new_symbol => {
                if (subscribed_symbol_array.includes(new_symbol)) {
                    subscribed_total--;
                }
            })
            return resolve(subscribed_total <= 10);
        });
    })
}

/**
  * @function _updateUserAndSubscription Update users and symbols_subscribe data in files
  */
exports._updateUserAndSubscription = (user_name, symbols) => {
    return new Promise((resolve, reject) => {
        updateUserData(user_name, symbols).then(() => {
            updateSymbolsSubscribeData(user_name, symbols).then(() => {
                return resolve('Data updated!');
            })
        })
    })
}

/**
  * @function _checkSymbolSubscibedIEX Find new symbols to subscribe for IEX data
  * @returns {Array} New symbols array to subscribe IEX data
  */
exports._checkSymbolSubscibedIEX = (symbols) => {
    return new Promise((resolve, reject) => {
        let symbol_file = path.resolve(__dirname, '../data/symbols_subscribe.json');
        fs.readFile(symbol_file, 'utf8', (err, data) => {
            let symbols_data = JSON.parse(data);
            let new_symbols = [];
            // Find out new symbols not subscribed for IEX data
            symbols.split(',').forEach(symbol => {
                if (symbols_data[symbol]['subscribed'] === false) {
                    new_symbols.push(symbol);
                    symbols_data[symbol]['subscribed'] = true;
                }
            });
            fs.writeFile(symbol_file, JSON.stringify(symbols_data), () => {
                return resolve(new_symbols.join(','));
            })
        });
    })
}

/**
  * @function _handleUnsubscription Remove user from symbol subscriber data
  */
exports._handleUnsubscription = (user_name, symbols) => {
    return new Promise((resolve, reject) => {
        handleUserUnsubscribe(user_name, symbols).then(() => {
            handleSymbolUnsubscribe(user_name, symbols).then(() => {
                return resolve('Data unsubscribed!');
            })
        })
    })
}

/**
  * @function updateUserData Update 'users.json' data with new user_name and subscribed symbols
  */
function updateUserData(user_name, symbols) {
    return new Promise((resolve, reject) => {
        let user_file = path.resolve(__dirname, '../data/users.json');
        fs.readFile(user_file, 'utf8', (err, data) => {
            let user_data = JSON.parse(data);
            let user_subscribe_symbol = '';
            // Check and remove repeat symbol subscriptions
            if (user_data.hasOwnProperty(user_name)) {
                let subscribed_symbol_array = user_data[user_name].split(',');
                let new_symbol_array = symbols.split(',');
                new_symbol_array.forEach(new_symbol => {
                    if (subscribed_symbol_array.includes(new_symbol)) {
                        subscribed_symbol_array.splice(subscribed_symbol_array.indexOf(new_symbol), 1);
                    }
                })
                user_subscribe_symbol = subscribed_symbol_array.concat(new_symbol_array).join(',');
            }
            else {
                user_subscribe_symbol = symbols;
            }
            user_data[user_name] = user_subscribe_symbol;
            fs.writeFile(user_file, JSON.stringify(user_data), () => {
                return resolve('User data updated!');
            })
        });
    })
}

/**
  * @function updateSymbolsSubscribeData Update 'symbols_subscribe.json' data with new subscriber user name and IEX data subscribed status
  */
function updateSymbolsSubscribeData(user_name, symbols) {
    return new Promise((resolve, reject) => {
        let symbol_file = path.resolve(__dirname, '../data/symbols_subscribe.json');
        fs.readFile(symbol_file, 'utf8', (err, data) => {
            let symbols_data = JSON.parse(data);
            symbols.split(',').forEach(symbol => {
                // Init new symbol data
                if (!symbols_data.hasOwnProperty(symbol)) {
                    symbols_data[symbol] = { 'subscribed': false, 'users': [] };
                }
                // Add user to symbol subscriber
                if (!symbols_data[symbol]['users'].includes(user_name)) {
                    symbols_data[symbol]['users'].push(user_name);
                }
            });
            fs.writeFile(symbol_file, JSON.stringify(symbols_data), () => {
                return resolve('Symbol subscription data updated!');
            })
        });
    })
}

/**
  * @function handleUserUnsubscribe Remove unsubscribed symbols from 'users.json'
  */
function handleUserUnsubscribe(user_name, symbols) {
    return new Promise((resolve, reject) => {
        let user_file = path.resolve(__dirname, '../data/users.json');
        fs.readFile(user_file, 'utf8', (err, data) => {
            let user_data = JSON.parse(data);
            symbols.split(',').forEach(symbol => {
                // Remove unsubscribed symbols from user subscribed symbol string
                let symbols_array = user_data[user_name].split(',');
                let symbol_index = symbols_array.indexOf(symbol);
                if (symbol_index !== -1) {
                    symbols_array.splice(symbol_index, 1);
                    user_data[user_name] = symbols_array.join(',');
                }
            });
            fs.writeFile(user_file, JSON.stringify(user_data), () => {
                return resolve('User data updated!');
            })
        });
    })
}

/**
  * @function handleSymbolUnsubscribe Remove user name from 'symbols_subscribe.json' symbol subscriber list
  * @returns {Array} Array of no subscriber symbols, return to unsubscribe IEX data service
  */
function handleSymbolUnsubscribe(user_name, symbols) {
    return new Promise((resolve, reject) => {
        let symbol_file = path.resolve(__dirname, '../data/symbols_subscribe.json');
        fs.readFile(symbol_file, 'utf8', (err, data) => {
            let symbols_data = JSON.parse(data);
            let unsubscribe_symbols = [];
            symbols.split(',').forEach(symbol => {
                // Remove user name from symbol subscriber list
                let username_index = symbols_data[symbol]['users'].indexOf(user_name);
                if (username_index !== -1) {
                    symbols_data[symbol]['users'].splice(username_index, 1);
                }
                // Add symbol of no subscriber to return array
                if (symbols_data[symbol]['users'].length === 0) {
                    unsubscribe_symbols.push(symbol);
                    delete symbols_data[symbol];
                }
            });
            fs.writeFile(symbol_file, JSON.stringify(symbols_data), () => {
                return resolve(unsubscribe_symbols.join(','));
            })
        });
    })
}