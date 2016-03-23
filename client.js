var self = this;
var express = require('express');
var Firebase = require('firebase');
var bodyParser = require('body-parser');
const EventEmiter = require('events');

var app = express();
var admin = express();
var firebaseRef = new Firebase('https://wptc.firebaseio.com/');
var myEmiter = new EventEmiter();