module.exports = function () {

    //requires
    var express = require('express');
    var bodyParser = require('body-parser');
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var dbConfig = require('./db.js');
    var User = require('./user');
    var mongoose = require('mongoose');
    var flash = require('express-flash');
    var expressSession = require('express-session');
    var fs = require('fs');
    var path = require("path");

    mongoose.connect(dbConfig.url);

    //variables
    var app = express();
    var admin = express();

    //express config
    admin.use(express.static('admin'));
    app.use(express.static('app'));
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(expressSession({
        secret: 'mySecretKey'
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    //passport configuration
    passport.use('login', new LocalStrategy(
        function (username, password, done) {
            User.findOne({
                username: username
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Incorrect username.'
                    });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }
                return done(null, user);
            });
        }
    ));

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
    app.get('/users',
        passport.authenticate('login'),
        function (req, res) {

            console.log("authentication successful");
        }

    );

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

    app.get('/app/message', function (req, res) {
        var query = req.query;
        res.statusCode = 200;
        res.send('ok');
    });

    app.get('/villa/state', function (req, res) {
        res.statusCode = 200;
        var encState = encrypt(JSON.stringify(state));
        res.send(encState);
    });

    app.get('/login', function (req, res) {
        res.statusCode = 200;
        res.sendFile(path.join(__dirname + '/app/login.html'));
    });

    app.post('/login', passport.authenticate('login', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }), function (req, res) {
        console.log("Authenticated through login page");
    });
}
