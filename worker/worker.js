var self = this;
var express = require('express');
var Firebase = require('firebase');
var bodyParser = require('body-parser');
var request = require('request');
const EventEmiter = require('events');
var fs = require('fs');
var config = require('./config');
const crypto = require('crypto');

//var five = require('johnny-five');
//var board = new five.Board();

var baseUrl = config.protocol + "://" + config.serverIp + ":" + config.serverPort;

console.log(baseUrl);

var app = express();
var admin = express();
var myEmiter = new EventEmiter();

//board.on("ready", function () {
//    // Create an Led on pin 13
//    var strobe = new five.Pin(13);
//    var state = 0x00;
//
//    strobe.write(state ^= 0x01);
//
//
//    var motion = new five.Motion({
//        pin: 12
//    });
//    // "calibrated" occurs once, at the beginning of a session,
//    motion.on("calibrated", function () {
//        console.log("calibrated");
//    });
//
//    // "motionstart" events are fired when the "calibrated"
//    // proximal area is disrupted, generally by some form of movement
//    motion.on("motionstart", function () {
//        console.log("motionstart");
//        request(baseUrl + '/workers/motion?zone=1', function (error, response, body) {
//            if (!error && response.statusCode == 200) {
//                console.log(body); // Show the HTML for the Modulus homepage.
//            }
//        });
//    });
//
//
//    // "motionend" events are fired following a "motionstart" event
//    // when no movement has occurred in X ms
//    motion.on("motionend", function () {
//
//    });
//});

var worker = app.listen(8003, function () {
    console.log("Worker listening at 8003");
});

var state = {
    address: config.id,
    ip: "10.10.10.10"
};

var villaState = {};

console.log(state);

app.get('/power', function (req, res) {
    var objStr = JSON.stringify(state);
    console.log(objStr);
    res.send(encrypt(objStr));
});

var checkIn = function () {
    var objStr = JSON.stringify(state);
    console.log(objStr);
    request({
        url: baseUrl + '/workers/power',
        method: 'GET',
        qs: {
            data: encrypt(objStr)
        }
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            if (response.statusCode != 404) {
                console.log(response.statusCode + " checked in");
            } else {
                console.log(body);
            }
        }
    });
    request({
        url: baseUrl + '/villa/state',
        method: 'GET',
        qs: "12345"
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            if (response.statusCode != 404) {
                console.log(body)
                self.villaState = decrypt(body);
                console.log(self.villaState)
            } else {
                console.log(response.statusCode);
            }
        }
    });

};

var encrypt = function (str) {
    const cipher = crypto.createCipher('aes256', config.cryptKey);
    var encrypted = null;
    encrypted = cipher.update(str, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(str) {
    const decipher = crypto.createDecipher('aes256', config.cryptKey);
    var decrypted = decipher.update(str, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

setInterval(checkIn, 5000);
