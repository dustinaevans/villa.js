var self = this;
var express = require('express');
var Firebase = require('firebase');
var bodyParser = require('body-parser');
var request = require('request');
const EventEmiter = require('events');

var app = express();
var admin = express();
var firebaseRef = new Firebase('https://wptc.firebaseio.com/');
var myEmiter = new EventEmiter();

var id = "0001";

var state = {
    address: id
};

var client = app.listen(8003, function () {
    console.log("Client listening at 8003");
});

app.get('/power', function (req, res) {
    res.send(state);
});

var checkIn = function () {
    request({
        url: 'http://localhost:8001/clients/power',
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

setInterval(checkIn, 10000);
