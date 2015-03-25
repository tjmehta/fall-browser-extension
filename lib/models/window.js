'use strict';
var Model = require('./model');
var Tabs = require('models/tabs');

function Window (browserWindow) {
  console.log('Window', this);
  Model.call(this);
  this.setTabs(browserWindow);
  this.browserWindow = browserWindow;
  this.attachWindowEvents();
}

require('util').inherits(Window, Model);

// made this a function for future browser compatibility
Window.prototype.setTabs = function (browserWindow) {
  console.log('setTabs', arguments);
  this.tabs = new Tabs(browserWindow.tabs);
};

Window.prototype.attachWindowEvents = function () {
  console.log('attachWindowEvents', arguments);
  this.browserWindow.addEventListener('close', this.handleClose);
};

Window.prototype.handleClose = function () {
  console.log('handleClose', arguments);
  this.destroy();
  this.emit('close', this);
};

Window.prototype.destroy = function () {
  console.log('destroy', arguments);
  this.stopListening();
  this.tabs.forEach(function (tab) {
    tab.destroy();
  });
  this.super('destroy');
};

Window.prototype.stopListening = function () {
  console.log('stopListening', arguments);
  this.browserWindow.removeEventListener('close', this.handleClose);
};

require('util').inherits(Window, Model);



module.exports = Window;