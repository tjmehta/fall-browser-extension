'use strict';

var Collection = require('models/collection');
var Window     = require('models/window');

function Windows (windows) {
  Collection.call(this);
  windows.forEach(this.push.bind(this));
}

require('util').inherits(Windows, Collection);

Windows.prototype.listenToModel = function (window) {
  window.on('close',  this.handleTabClose);
};

Windows.prototype.handleWindowClose = function (window) {
  this.remove(window);
  this.emit('window:close', window);
};

Windows.prototype.stopListeningToModel = function (window) {
  window.off('close', this.handleTabClose);
};

Windows.prototype.Model = Window;

module.exports = Windows;