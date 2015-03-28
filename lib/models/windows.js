'use strict';

var Collection = require('models/collection');
var Window     = require('models/window');

function Windows (windows) {
  console.log(this.constructor.name, 'Windows', arguments);
  Collection.call(this);
  windows.forEach(this.push.bind(this));
}

require('util').inherits(Windows, Collection);

Windows.prototype.listenToModel = function (win) {
  console.log(this.constructor.name, 'listenToModel', arguments);
  win.on('close',  this.handleWinClose);
};

Windows.prototype.handleWinClose = function (win) {
  console.log(this.constructor.name, 'handleWinClose', arguments);
  this.remove(win);
  this.emit('win:close', win);
};

Windows.prototype.stopListeningToModel = function (win) {
  console.log(this.constructor.name, 'stopListeningToModel', arguments);
  win.off('close', this.handleWinClose);
};

Windows.prototype.Model = Window;

module.exports = Windows;