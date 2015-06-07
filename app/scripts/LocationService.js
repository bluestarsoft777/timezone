/**
 * LocationService handles the locations data and it's
 * updates via REST API and sockets.
 * It serves as a shared data storage and can be used
 * by multiple controllers to keep their data in sync.
 */
var LocationService = function ($http, $rootScope, socket) {
  var baseUrl = '/api/locations';
  var locations = [];

  $http.get(baseUrl)
  .then(function (results) {
    locations = results.data;
    // notify all listeners of update
    $rootScope.$broadcast('locationsUpdated');

    // keep the location changes synced accross all clients via sockets
    socket.syncUpdates('location', locations, function () {
      console.log('Sockets syncing locations');
    });
  });

  function getLocations() {
    return locations;
  }

  function postLocations(location) {
      return $http.post(baseUrl, {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        _id: location._id
      });
  }

  function deleteLocation(id) {
    return $http.delete(baseUrl + '/' + id);
  }

  return {
    getAll: getLocations,
    create: postLocations,
    delete: deleteLocation
  };
};

module.exports = LocationService;
