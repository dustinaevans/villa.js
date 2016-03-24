//Requires
var self = this;
var express = require('express');
var Firebase = require('firebase');
var bodyParser = require('body-parser');
const EventEmiter = require('events');

//variables
var app = express();
var admin = express();
var firebaseRef = new Firebase('https://villajs.firebaseio.com');
var myEmiter = new EventEmiter();
var clients = {};

//anonymous auth
firebaseRef.authAnonymously(function (error, authData) {
    if (error) {
        console.log("Authentication Failed!", error);
    } else {
        console.log("Authenticated successfully");
    }
});

//initialize clients
function getSnapshot() {
    firebaseRef.child('clients').on('value', function (snapshot) {
            clients = snapshot.val();
            console.log("getSnapshot()");
            console.log(clients);
            return snapshot.val();

        }),
        function (errorObject) {
            console.log(errorObject);
        };
};
//static serve
admin.use(express.static('admin'));
app.use(express.static('app'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


//listeners
var server = app.listen(8001, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Villa.js server listening at http: //%s:%s", host, port)
});
var admin = admin.listen(8002, function () {
    var adminH = admin.address().address
    var adminP = admin.address().port
    console.log("Admin application listening at http://%s:%s", adminH, adminP);
});


//routes
app.get('/users', function (req, res) {
    console.log('get request to root');
});

app.post('/users', function (req, res) {
    myEmiter.emit('postEvent');
});

app.post('/clients/power', function (req, res) {
    var clientObj = req.body;
    myEmiter.emit('clientAliveEvent', clientObj);
    res.statusCode = 200;
    res.send('ok');
});


// Events
myEmiter.on('postEvent', () => {
    console.log("Post event called.");

});

myEmiter.on('clientAliveEvent', function (clientObj) {
    console.log("clientAliveEvent {");
    console.log("client " + clientObj.address + " is alive.")
    var fbDate = Firebase.ServerValue.TIMESTAMP;
    var thisClient = {
        lastCheckin: fbDate,
        ip: clientObj.ip
    };
    firebaseRef.child('clients/' + clientObj.address).update(thisClient);
    console.log("}\n")
});




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