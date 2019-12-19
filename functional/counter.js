const fs = require('fs');
const path = require('path');

// Initialize 'counter.json' in 'data' folder when service started
exports._initDataFiles = () => {
    return new Promise((resolve, reject) => {
        let counter_file = path.resolve(__dirname, '../data/counter.json');
        let init_json_data = { "IP": {}, "ID": {} };
        fs.writeFile(counter_file, JSON.stringify(init_json_data), () => {
            return resolve('Data files refreshed!');
        })
    })
}

// Add 'counter.json' IP and ID counter function
exports._addCount = (ip, id) => {
    return new Promise((resolve, reject) => {
        let file_path = path.resolve(__dirname, '../data/counter.json');
        fs.readFile(file_path, 'utf8', (err, data) => {
            let file_data = JSON.parse(data);
            if (!file_data['IP'].hasOwnProperty(ip)) {
                file_data['IP'][ip] = 0;
            }
            file_data['IP'][ip] += 1;
            if (!file_data['ID'].hasOwnProperty(id)) {
                file_data['ID'][id] = 0;
            }
            file_data['ID'][id] += 1;
            let count_data = { 'IP': file_data['IP'][ip], 'ID': file_data['ID'][id] };
            fs.writeFile(file_path, JSON.stringify(file_data), () => {
                return resolve(count_data);
            })
        })
    })
}

// Set 'counter.json' IP and ID counter to 0
exports._setCounterToZero = () => {
    return new Promise((resolve, reject) => {
        let file_path = path.resolve(__dirname, '../data/counter.json');
        fs.readFile(file_path, 'utf8', (err, data) => {
            let file_data = JSON.parse(data);
            Object.keys(file_data['ID']).map(user_id => {
                file_data['ID'][user_id] = 0;
            })
            Object.keys(file_data['IP']).map(user_ip => {
                file_data['IP'][user_ip] = 0;
            })
            fs.writeFile(file_path, JSON.stringify(file_data), () => {
                return resolve('Reset counter event finished!');
            })
        })
    })
}