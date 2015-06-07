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

var app = angular.module('myApp', [
  'uiGmapgoogle-maps',
  'ngAutocomplete',
  'btford.socket-io'
]);

app.factory('SocketService', ['socketFactory', SocketService]);
app.factory('LocationService', ['$http', '$rootScope', 'SocketService', LocationService]);

app.controller('LocationsCtrl', function ($scope, LocationService) {

  // autocomplete
  $scope.options = {
    types: '(cities)',  // filter only cities
    watchEnter: true    // select the first result on enter
  };
  $scope.details = null;
  $scope.location = null;
  $scope.activeLocation = null;
  $scope.error = '';

  // get current locations and listen for change events
  $scope.locations = LocationService.getAll();
  $scope.$on('locationsUpdated', function () {
    $scope.locations = LocationService.getAll();
  });


  // location form submit
  $scope.submit = function (event) {
    event.preventDefault();

    if (!this.location) {
      this.error = 'Can\'t search while the input is empty.';
      return;
    }

    // get location info
    var details = this.details;

    if (isEmpty(this.details)) {
      this.error = 'Coulnd\'t find a town with that name, try again.';
      return;
    }


    var location = {
      _id: details.id,
      name: details.formatted_address,
      latitude: details.geometry.location.lat(),
      longitude: details.geometry.location.lng()
    };

    // check if the location is available locally first...
    this.activeLocation = find(this.locations, function (loc) {
        return loc._id == location._id;
    });
    if (this.activeLocation) return;


    // ...otherwise query for it
    var self = this;
    LocationService.create(location)
    .then(function (response) {
      self.activeLocation = response.data;
    })
    .catch(function (error) {
      console.log('Error creating location');
      console.error(error);
      self.error = "Error happened while searching for the location.";
    });
  };

  // general map settings
  $scope.map = { center: { latitude: 21.596151, longitude: -42.520753 }, zoom: 1 };
});
