'use strict';
var Model = require('./model');
var Tabs = require('models/tabs');

function Window (browserWindow) {
  Model.call(this);
  this.setTabs(browserWindow);
  this.browserWindow = browserWindow;
  this.attachWindowEvents();
}

require('util').inherits(Window, Model);

// made this a function for future browser compatibility
Window.prototype.setTabs = function (browserWindow) {
  this.tabs = new Tabs(browserWindow.tabs);
};

Window.prototype.attachWindowEvents = function () {
  this.browserWindow.on('close', this.handleClose);
};

Window.prototype.handleClose = function () {
  this.destroy();
  this.emit('close', this);
};

Window.prototype.destroy = function () {
  this.tabs.forEach(function (tab) {
    tab.destroy();
  });
  this.super('destroy');
};

require('util').inherits(Window, Model);



module.exports = Window;