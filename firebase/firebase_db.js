const firebase_admin = require('firebase-admin'); // Firebase library
const serviceAccount = require('./fugle_firebase_config.json'); // Firebase config

const firebase = firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
    databaseURL: 'https://fugle-assignment-db.firebaseio.com',
    databaseAuthVariableOverride: {
        uid: "fugle_server"
    }
});

const db = firebase.database();

// Add DB counter function
exports._transactionCount = function (_Path, _AddCount, _Callback) {
    var ref = db.ref(_Path);
    return ref.transaction(function (currentRank) {
        // If _Path has never been set, currentRank will be `null`.
        return Number(currentRank) + _AddCount;
    }).then(function (_Count) {
        return Promise.resolve(_Callback(_Count.snapshot.val()));
    });
};
// Set DB counter to 0
exports._setCounterToZero = function (_Path) {
    var db_ref = db.ref(_Path);
    db_ref.once("value", function (snapshot) {
        snapshot.forEach(function (child) {
            child.ref.update({
                counter: 0
            });
        });
    });
}
