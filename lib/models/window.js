'use strict';
var Model = require('./model');
var Tabs = require('models/tabs');

function Window (browserWindow) {
  console.log(this.constructor.name, 'Window', arguments);
  Model.call(this);
  this.setTabs(browserWindow);
  this.browserWindow = browserWindow;
  this.listenToWindow();
}

require('util').inherits(Window, Model);

// made this a function for future browser compatibility
Window.prototype.setTabs = function (browserWindow) {
  console.log(this.constructor.name, 'setTabs', arguments);
  this.tabs = new Tabs(browserWindow.tabs);
};

Window.prototype.listenToWindow = function () {
  console.log(this.constructor.name, 'listenToWindow', arguments);
  this.browserWindow.addEventListener('close', this.handleClose);
};

Window.prototype.handleClose = function () {
  console.log(this.constructor.name, 'handleClose', arguments);
  this.destroy();
  this.emit('close', this);
};

Window.prototype.destroy = function () {
  console.log('destroy', arguments);
  this.stopListening();
  this.tabs.forEach(function (tab) {
    tab.destroy();
  });
  this.emit('destroy', this);
};

Window.prototype.stopListening = function () {
  console.log(this.constructor.name, 'stopListening', arguments);
  this.browserWindow.removeEventListener('close', this.handleClose);
};

module.exports = Window;