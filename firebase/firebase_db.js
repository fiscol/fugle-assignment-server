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

// exports._setScbsribedSymbols = function (_Path, _UserID, _Symbol) {
//     var db_ref = db.ref(`${_Path}/${_UserID}`);
//     db_ref.once("value", function (snapshot) {
//         if (snapshot.val() != null) {
//             snapshot.ref.update({
//                 subscribed: (snapshot.val().hasOwnProperty('subscribed')) ? `${snapshot.val()['subscribed']},${_Symbol}` : _Symbol
//             });
//         }
//         else {
//             db_ref.update({
//                 counter: 0,
//                 subscribed: _Symbol
//             });
//         }
//     });
// }

// exports._getScbsribedSymbols = function (_Path, _UserID) {
//     var db_ref = db.ref(`${_Path}/${_UserID}/subscribed`);
//     return new Promise((resolve, reject) => {
//         db_ref.once("value", function (snapshot) {
//             if (snapshot.val() != null) {
//                 return resolve(snapshot.val());
//             }
//             else {
//                 return resolve(undefined);
//             }
//         });
//     });
// }