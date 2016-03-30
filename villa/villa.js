//Requires
var self = this;
var Firebase = require('firebase');
const EventEmiter = require('events');
var config = require('./config');
var crypto = require('crypto');
var later = require('later');
var fs = require('fs');
var routes = require('./routes');
routes();

var state = {
    armed: false,
    away: true
}

//variables

var firebaseRef = new Firebase(config.firebaseUrl);
var myEmiter = new EventEmiter();
var workers = {};
var decryptedMessage = "";
later.date.localTime();
var sched = later.parse.text("at 5:00pm every day");
//console.log(later.schedule(sched).next(10));

//anonymous auth
firebaseRef.authAnonymously(function (error, authData) {
    if (error) {
        console.log("Authentication Failed!", error);
    } else {
        console.log("Authenticated successfully");
    }
});

//initialize workers database
function getSnapshot() {
    firebaseRef.child('workers').on('value', function (snapshot) {
            workers = snapshot.val();
            console.log("getSnapshot()");
            console.log(workers);
            return snapshot.val();

        }),
        function (errorObject) {
            console.log(errorObject);
        };
};

//mongoose.connect('mongodb://172.16.1.120/villajs');

//var db = mongoose.connection;

//static serve


// Events
myEmiter.on('postEvent', function () {
    console.log("Post event called.");

});

myEmiter.on('clientAliveEvent', function (clientObj) {
    console.log(new Date().toLocaleString() + "  :  client " + clientObj.address + " is alive.")
    var fbDate = Firebase.ServerValue.TIMESTAMP;
    var thisClient = {
        lastCheckin: fbDate,
        ip: clientObj.ip
    };
    //firebaseRef.child('workers/' + clientObj.address).update(thisClient);
});

//functions
var encrypt = function (str) {
    var cipher = crypto.createCipher('aes256', config.cryptKey);
    var encrypted = cipher.update(str, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

var decrypt = function (str) {
    var decipher = crypto.createDecipher('aes256', config.cryptKey);
    var decrypted = decipher.update(str, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    //console.log(typeof decrypted);
    return decrypted;
}
