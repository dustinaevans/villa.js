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

//mongoose.connect('mongodb://172.16.1.120/villajs');

//var db = mongoose.connection;

//static serve
admin.use(express.static('admin'));
app.use(express.static('app'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


//listeners
var server = app.listen(config.appPort, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Villa.js server listening at http: //%s:%s", host, port)
});
var admin = admin.listen(config.adminPort, function () {
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

app.get('/workers/motion/', function (req, res) {
    var query = req.query;
    var zone = query.zone;

    console.log(new Date().toLocaleString() +
        "  :  Motion detected at zone: " + zone);
})

app.get('/workers/power', function (req, res) {
    var query = req.query;
    var data = query.data;
    var decrypted = decrypt(data);
    var clientObj = JSON.parse(decrypt(query.data));
    //console.log("clientObj: " + clientObj);
    clientObj.ip = "10.10.10.10"; //req.connection.remoteAddress;
    myEmiter.emit('clientAliveEvent', clientObj);
    res.statusCode = 200;
    res.send('ok');
});


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