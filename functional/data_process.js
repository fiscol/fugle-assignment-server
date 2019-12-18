const fs = require('fs');
const path = require('path');

exports._initDataFiles = function () {
    return new Promise(function (resolve, reject) {
        let user_file = path.resolve(__dirname, '../data/users.json');
        let symbol_subscribe_file = path.resolve(__dirname, '../data/symbols_subscribe.json');
        let symbol_data_file = path.resolve(__dirname, '../data/all_symbol_data.json');
        fs.writeFile(user_file, JSON.stringify({}), () => {
            fs.writeFile(symbol_subscribe_file, JSON.stringify({}), () => {
                fs.writeFile(symbol_data_file, JSON.stringify({}), () => {
                    return resolve('Data files refreshed!');
                })
            })
        })
    })
}


exports._checkUserSubscribe = function (username, symbols) {
    return new Promise(function (resolve, reject) {
        let user_file = path.resolve(__dirname, '../data/users.json');
        fs.readFile(user_file, 'utf8', (err, data) => {
            let user_data = JSON.parse(data);
            let subscribed_total = (user_data.hasOwnProperty(username)) ? user_data[username].split(',').length + symbols.split(',').length : symbols.split(',').length;
            return resolve(subscribed_total <= 10);
        });
    })
}

exports._updateUserAndSubscription = function (username, symbols) {
    return new Promise(function (resolve, reject) {
        updateUserData(username, symbols).then(() => {
            updateSymbolsSubscribeData(username, symbols).then(() => {
                return resolve('Data updated!');
            })
        })
    })
}

exports._checkSymbolSubscibed = function (symbols) {
    return new Promise(function (resolve, reject) {
        let symbol_file = path.resolve(__dirname, '../data/symbols_subscribe.json');
        fs.readFile(symbol_file, 'utf8', (err, data) => {
            let symbols_data = JSON.parse(data);
            let new_symbols = [];
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

exports._handleUnsubscription = function (username, symbols) {
    return new Promise(function (resolve, reject) {
        handleUserUnsubscribe(username, symbols).then(() => {
            handleSymbolUnsubscribe(username, symbols).then(() => {
                return resolve('Data unsubscribed!');
            })
        })
    })
}

function updateUserData(username, symbols) {
    return new Promise(function (resolve, reject) {
        let user_file = path.resolve(__dirname, '../data/users.json');
        fs.readFile(user_file, 'utf8', (err, data) => {
            let user_data = JSON.parse(data);
            let subscribe_symbol = (user_data.hasOwnProperty(username)) ? `${data[username]},${symbols}` : symbols;
            user_data[username] = subscribe_symbol;
            fs.writeFile(user_file, JSON.stringify(user_data), () => {
                return resolve('User data updated!');
            })
        });
    })
}

function updateSymbolsSubscribeData(username, symbols) {
    return new Promise(function (resolve, reject) {
        let symbol_file = path.resolve(__dirname, '../data/symbols_subscribe.json');
        fs.readFile(symbol_file, 'utf8', (err, data) => {
            let symbols_data = JSON.parse(data);
            symbols.split(',').forEach(symbol => {
                if (!symbols_data.hasOwnProperty(symbol)) {
                    symbols_data[symbol] = { 'subscribed': false, 'users': [] };
                }
                if (!symbols_data[symbol]['users'].includes(username)) {
                    symbols_data[symbol]['users'].push(username);
                }
            });
            fs.writeFile(symbol_file, JSON.stringify(symbols_data), () => {
                return resolve('Symbol subscription data updated!');
            })
        });
    })
}

function handleUserUnsubscribe(username, symbols) {
    return new Promise(function (resolve, reject) {
        let user_file = path.resolve(__dirname, '../data/users.json');
        fs.readFile(user_file, 'utf8', (err, data) => {
            let user_data = JSON.parse(data);
            symbols.split(',').forEach(symbol => {
                let symbol_index = user_data[username].split(',').indexOf(symbol);
                user_data[username] = user_data[username].split(',').splice(symbol_index, 1).join(',');
            });
            fs.writeFile(user_file, JSON.stringify(user_data), () => {
                return resolve('User data updated!');
            })
        });
    })
}

function handleSymbolUnsubscribe(username, symbols) {
    return new Promise(function (resolve, reject) {
        let symbol_file = path.resolve(__dirname, '../data/symbols_subscribe.json');
        fs.readFile(symbol_file, 'utf8', (err, data) => {
            let symbols_data = JSON.parse(data);
            let unsubscribe_symbols = [];
            symbols.split(',').forEach(symbol => {
                let username_index = symbols_data[symbol]['users'].indexOf(username);
                symbols_data[symbol]['users'].splice(username_index, 1);
                if (symbols_data[symbol]['users'].length === 0) {
                    unsubscribe_symbols.push(symbol);
                }
            });
            fs.writeFile(symbol_file, JSON.stringify(symbols_data), () => {
                return resolve(unsubscribe_symbols.join(','));
            })
        });
    })
}