var express = require('express');
var app = express();
var admin = express();

var Firebase = require('firebase');

var firebaseRef = new Firebase('https://wptc.firebaseio.com/');

var self = this;

function getUsers() {
    firebaseRef.child('users').on('value', function (snapshot) {
        console.log(snapshot.val());
    });
};

admin.use(express.static('admin'));

app.use(express.static('app'));

var client = app.listen(8001, function () {
    var host = client.address().address
    var port = client.address().port

    console.log("Villa.js server listening at http: //%s:%s", host, port)
});
var admin = admin.listen(8002, function () {
    var adminH = admin.address().address
    var adminP = admin.address().port
    console.log("Admin application listening at http://%s:%s", adminH, adminP);
});
