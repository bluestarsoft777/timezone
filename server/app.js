'use strict';

var http = require('http');
var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/options');

mongoose.connect(config.mongo.uri, config.mongo.options);

var app = express();
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: true,
  path: '/socket.io-client'
});

require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);


server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d', parseInt(config.port, 10));
});

exports = module.exports = app;
