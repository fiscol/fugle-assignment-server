const schedule = require('node-schedule');
const firebase = require('../firebase/firebase_db');

// 每分鐘自動掃描並執行排程任務
exports.refresh_counter = function () {
    schedule.scheduleJob({ start: new Date(Date.now()), rule: '*/1 * * * *' }, function () {
        firebase._setCounterToZero('/data/id');
        firebase._setCounterToZero('/data/ip');
    })
};