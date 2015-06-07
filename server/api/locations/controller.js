/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /locations              ->  index
 * POST    /locations              ->  create
 * GET     /locations/:id          ->  show
 * PUT     /locations/:id          ->  update
 * DELETE  /locations/:id          ->  destroy
 */

'use strict';

var merge = require('lodash/object/merge');
var Promise = require('bluebird');
var Location = require('./model');
var getTimezone = require('../../components/google/timezone');

// Basic error handling function,
// should add some logging
function handleError(res, err) {
  console.log(err);
  return res.status(500).json(err);
}

// Get list of locations
exports.index = function(req, res) {
  Location.find(function (err, locations) {
    if (err) {
      return handleError(res, err);
    }

    return res.status(200).json(locations);
  });
};

// Get a single location
exports.show = function (req, res) {
  Location.findById(req.params.id, function (err, location) {
    if (err) { return handleError(res, err); }
    if (!location) { return res.send(404); }

    return res.json(location);
  });
};

exports.create = function (req, res) {
  var location = req.body;
  var latitude = location.latitude;
  var longitude = location.longitude;

  // Check if the location is already saved, avoid searching
  // the Google API if the location is already saved
  Location.findByIdAsync(location._id)
  .then(function (found) {

    if (!found) {
        return getTimezone(latitude, longitude)
        .then(function (locationData) {

          // create and save the new Location
          var newLocation = new Location();
          merge(newLocation, location, {
            timezoneOffset: locationData.rawOffset,
            timeoneId: locationData.timeZoneId,
            timezoneName: locationData.timeZoneName
          });

          return newLocation.saveAsync();
        })
        .spread(function (savedLocation) {
          return res.status(201).json(savedLocation);
        })
        .catch(function (err) {
          return handleError(res, err);
        });
    }

    return res.status(201).json(found);
  })
  .catch(function (err) {
      return handleError(res, err);
  });
};

// Update an existing location
exports.update = function (req, res) {
  // if(req.body._id) { delete req.body._id; }

  Location.findById(req.params.id, function (err, location) {
    if (err) { return handleError(res, err); }
    if (!location) { return res.send(404); }

    var updated = merge(location, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }

      return res.status(200).json(updated);
    });
  });
};

// Delete a location
exports.destroy = function (req, res) {
  Location.findById(req.params.id, function (err, location) {
    if (err) { return handleError(res, err); }
    if (!location) { return res.send(404); }

    location.remove(function (err) {
      if (err) { return handleError(res, err); }

      return res.send(204);
    });
  });
};
