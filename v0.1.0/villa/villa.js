//Requires
var self = this;
var express = require('express');
var Firebase = require('firebase');
var bodyParser = require('body-parser');
const EventEmiter = require('events');
var config = require('./config');
var crypto = require('crypto');
var routes = require('./routes');
routes();

//variables
var app = express();
var admin = express();
var firebaseRef = new Firebase(config.firebaseUrl);
var myEmiter = new EventEmiter();
var workers = {};

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

////Load the request module
//var request = require('request');
//
////Lets configure and request
//request({
//    url: 'https://modulus.io/contact/demo', //URL to hit
//    qs: {from: 'blog example', time: +new Date()}, //Query string data
//    method: 'POST',
//    headers: {
//        'Content-Type': 'MyContentType',
//        'Custom-Header': 'Custom Value'
//    },
//    body: 'Hello Hello! String body!' //Set the body as a string
//}, function(error, response, body){
//    if(error) {
//        console.log(error);
//    } else {
//        console.log(response.statusCode, body);
//    }
//});
