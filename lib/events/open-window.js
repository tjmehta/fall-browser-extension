'use strict';
var findIndex = require('101/find-index');
var equals = require('101/equals');

module.exports = {
  on: on,
  removeListener: removeListener
};

var handlers = [];

function on (handler) {
  console.log('openWindow', 'on', arguments);
  handlers.push(handler);
}

function removeListener (handler) {
  console.log('openWindow', 'removeListener', arguments);
  var index = findIndex(handlers, equals(handler));
  if (~index) {
    handlers.splice(index, 1);
  }
}

safari.application.addEventListener('open', openHandler, true);
function openHandler (evt) {
  console.log('openWindow', 'openHandler');
  if (evt.target instanceof SafariBrowserWindow) {
    console.log('openWindow', 'openWindowHandler', arguments);
    handlers.forEach(function (handler) {
      handler(evt);
    });
  }
}