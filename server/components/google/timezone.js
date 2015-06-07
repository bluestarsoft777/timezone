var request = require('superagent-bluebird-promise');
var googleTimezoneApiKey = 'AIzaSyC0cTPxoyMAnFxkMnp6iEFZr9mze6-JMD4';
var googleTimezoneApiEndpoint = 'https://maps.googleapis.com/maps/api/timezone/json';

function getTimezone(latitude, longitude) {

  var timestamp = (new Date()).getTime() / 1000; // Needed to query the API

  return request.get(googleTimezoneApiEndpoint)
    .query({
      location: latitude + ',' + longitude,
      timestamp: timestamp,
      key: googleTimezoneApiKey
    })
    .then(function (data) {
      return data.body;
    });
}

module.exports = getTimezone;
