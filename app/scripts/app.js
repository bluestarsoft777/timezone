'use strict';

window._ = require('lodash'); // Make lodash's '_' a global for Google Maps to work

var angular = require('angular');
var LocationService = require('./LocationService');
var SocketService = require('./socket/SocketService');
var find = require('lodash/collection/find');
var isEmpty = require('lodash/lang/isEmpty');

// load these libs, browserify will add them to the bundled script and make their internals available for usage
require('angular-google-maps');
require('ng-autocomplete');
require('angular-socket-io');
// require('angucomplete-alt');

var app = angular.module('myApp', [
  'uiGmapgoogle-maps',
  'ngAutocomplete',
  'btford.socket-io'
]);

app.factory('SocketService', ['socketFactory', SocketService]);
app.factory('LocationService', ['$http', '$rootScope', 'SocketService', LocationService]);

app.controller('LocationsCtrl', function ($scope, LocationService) {
  // general map settings
  $scope.map = { center: { latitude: 21.596151, longitude: -42.520753 }, zoom: 1 };

  // autocomplete
  $scope.options = {
    types: '(cities)',          // filter only cities
  watchEnter: true              // select the first result on enter
  };
  $scope.details = null;        // details about cities
  $scope.location = '';         // current location by name, bound to autocomplete input
  $scope.error = '';            // will hold an error message, if there's any

  $scope.activeLocation = null; // currently active location

  // get current locations and listen for change events
  $scope.locations = LocationService.getAll();
  $scope.$on('locationsUpdated', function () {
    $scope.locations = LocationService.getAll();
  });

  // The autocomplete lib is buggy, so I'm using this as a workaround
  // submit form when the results are available, not before
  $scope.$on('ngAutocomplete:place_changed', function (event, data) {
    $scope.submitForm(data);
  });

  $scope.$on('activeLocationSelected', function (event, selectedLocationId) {
    $scope.activeLocation = getLocation($scope.locations, selectedLocationId);
  });

  // location form submit
  $scope.submitForm = function (data) {
    this.error = '';

    // var details = this.details; // don't use this, it won't be updated in time
    var details = data;
    if (isEmpty(details)) {
      this.error = 'Please select a town from the list.';
      return;
    }

    var location = {
      _id: details.id,
      name: details.formatted_address,
      latitude: details.geometry.location.lat(),
      longitude: details.geometry.location.lng()
    };

    this.details = null;  // reset details

    // check if the location is available locally first...
    this.activeLocation = getLocation(this.locations, details.id);
    if (this.activeLocation) {
      return;
    }
    // ...otherwise query for it...
    var self = this;
    LocationService.create(location)
    .then(function (response) {
      self.activeLocation = response.data;
    })
    .catch(function (error) {
      console.error(error);
      self.error = 'Error happened while searching for the location.';
    });
  };

  // Select location when marker is clicked
  $scope.selectLocation = function (marker, event, $markerScope, googleArguments) {
    var locationId = marker.key;
    $scope.$emit('activeLocationSelected', locationId);
  };
});

function getLocation(locations, locationId) {
  return find(locations, function (loc) {
      return loc._id == locationId;
  });
}
