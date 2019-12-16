const firebase_admin = require('firebase-admin');

const serviceAccount = require('./fugle_firebase_config.json');

const firebase = firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert(serviceAccount),
  databaseURL: 'https://fugle-assignment-db.firebaseio.com',
  databaseAuthVariableOverride: {
    uid: "fugle_server"
  }
});

const db = firebase.database();

exports._set = function (_Path, _ChildName, _Value) {
    var ref = db.ref(_Path);
    return new Promise((resolve, reject) => {
        ref.child(_ChildName).set(_Value).then(function () {
            return resolve("Set succeed.");
        }).catch(function (err) {
            return reject("Set error:" + err);
        });
    });
};

exports._transactionCount = function (_Path, _AddCount, _Callback) {
    var ref = db.ref(_Path);
    return ref.transaction(function (currentRank) {
        // If _Path has never been set, currentRank will be `null`.
        return Number(currentRank) + _AddCount;
    }).then(function (_Count) {
        return Promise.resolve(_Callback(_Count.snapshot.val()));
    });
};