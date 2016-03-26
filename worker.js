var baseUrl = "http://172.16.1.120:8001"

var self = this;
var express = require('express');
var Firebase = require('firebase');
var bodyParser = require('body-parser');
var request = require('request');
const EventEmiter = require('events');
var fs = require('fs');
var five = require('johnny-five');
var board = new five.Board();


var app = express();
var admin = express();
var myEmiter = new EventEmiter();

board.on("ready", function () {
    // Create an Led on pin 13
    var strobe = new five.Pin(13);
    var state = 0x00;

    strobe.write(state ^= 0x01);


    var motion = new five.Motion({
        pin: 12
    });
    // "calibrated" occurs once, at the beginning of a session,
    motion.on("calibrated", function () {
        console.log("calibrated");
    });

    // "motionstart" events are fired when the "calibrated"
    // proximal area is disrupted, generally by some form of movement
    motion.on("motionstart", function () {
        console.log("motionstart");
        request(baseUrl + '/workers/motion?zone=1', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body); // Show the HTML for the Modulus homepage.
            }
        });
    });


    // "motionend" events are fired following a "motionstart" event
    // when no movement has occurred in X ms
    motion.on("motionend", function () {

    });
});

var id = "0001";

var worker = app.listen(8003, function () {
    console.log("Worker listening at 8003");
});

var state = {
    address: id,
    ip: worker.address().address
};

console.log(state);

app.get('/power', function (req, res) {
    res.send(state);
});

var checkIn = function () {
    request({
        url: baseUrl + '/workers/power',
        method: 'POST',
        json: state
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
};
setInterval(checkIn, 60000);
