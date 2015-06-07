'use strict';

var path = require('path');

var config = {
  port: '8081',
  mongo: {
    uri: 'mongodb://localhost/timezones',
    options: {
      db: {
        safe: true
      }
    }
  },
  secrets: {
    session: '13h2e$!#)=Uw89dsaoj20981y3e90ur0$()HRWD)'
  },
  root: path.normalize(__dirname + '/../../')
}

module.exports = config;
