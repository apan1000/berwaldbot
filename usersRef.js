var firebase = require('firebase');

/**
 * The Botkit firebase driver
 *
 * @param {Object} config This must contain either a `firebase_uri` property (deprecated) or a `databaseURL` property
 * @returns {{setLastActive: setLastAvtive()}}
 */
module.exports = function(config) {

    if (!config) {
        throw new Error('configuration is required.');
    }

    // Backwards compatibility shim
    var configuration;
    if (config.firebase_uri) {
        configuration.databaseURL = config.firebase_uri;
    } else if (!config.databaseURL) {
        throw new Error('databaseURL is required.');
    }   else {
        configuration = config;
    }

    var app = firebase.initializeApp(config),
        database = app.database(),
        rootRef = database.ref(),
        usersRef = rootRef.child('users');

    return {
        setLastActive: setLastActive()
    };
};

function setLastActive() {
    return function(data, cb) {
        var firebase_update = {};
        firebase_update['last_active'] = new Date();
        usersRef.child(''+data.id).update(firebase_update).then(cb);
    };
}
