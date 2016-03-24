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
        url: 'http://10.254.1.2:8001/workers/power',
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
