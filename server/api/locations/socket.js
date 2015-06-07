/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Location = require('./model');

exports.register = function(socket) {
  Location.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Location.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  console.log('SOCKET: Saving a location: ' + doc.name);
  socket.emit('location:save', doc);
}

function onRemove(socket, doc, cb) {
  console.log('SOCKET: Removing a location: ' + doc.name);
  socket.emit('location:remove', doc);
}
