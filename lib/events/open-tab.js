'use strict';
var findIndex = require('101/find-index');
var equals = require('101/equals');

module.exports = {
  on: on,
  removeListener: removeListener
};

var handlers = [];

function on (handler) {
  console.log('openTab', 'on', arguments);
  handlers.push(handler);
}

function removeListener (handler) {
  console.log('openTab', 'removeListener', arguments);
  var index = findIndex(handlers, equals(handler));
  if (~index) {
    handlers.splice(index, 1);
  }
}

safari.application.addEventListener('open', openHandler);
function openHandler (evt) {
  if (evt.target instanceof SafariBrowserTab) {
    console.log('openTab', 'openHandler', arguments);
    handlers.forEach(function (handler) {
      handler(evt);
    });
  }
}
