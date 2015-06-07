'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');

var Schema = mongoose.Schema;

var LocationSchema = new Schema({
  _id: String,
  name: String,
  latitude: Number,
  longitude: Number,
  timezoneName: String,
  timezoneId: String,
  timezoneOffset: Number
});

var Location = mongoose.model('Location', LocationSchema);

// This will enable the use of promises with Mongoose
// Usage:
//      Location.saveAsync()
//        .spread(function (location, rowsAffected) {
//            ... do something here...
//        })
//        .then(function () {
//            ... and here too...
//        })
Promise.promisifyAll(Location);
Promise.promisifyAll(Location.prototype);

module.exports = Location;
