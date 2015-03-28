'use strict';
var Model = require('models/model');
var settings = require('models/settings');
var exists = require('101/exists');
var pluck = require('101/pluck');
var equals = require('101/equals');
require('config');

function Tab (browserTab) {
  console.log(this.constructor.name, 'Tab', arguments);
  Model.call(this);
  this.time = {
    opened: Date.now()
  };
  this.browserTab = browserTab;
  this.listen();
  if (!this.isActive()) {
    this.handleExpirationTimeChange();
  }
}

require('util').inherits(Tab, Model);

// get method for future browser compatibility purposes
Tab.prototype.get = function (key) {
  console.log(this.constructor.name, 'get', arguments);
  return this.browserTab[key];
};

Tab.prototype.isActive = function () {
  console.log(this.constructor.name, 'isActive', arguments);
  return this.browserTab === this.browserTab.browserWindow.activeTab;
};

Tab.prototype.listen = function () {
  console.log(this.constructor.name, 'listen', arguments);
  this.browserTab.addEventListener('activate', this.stopTimeout);
  this.browserTab.addEventListener('deactivate', this.resetTimeout);
  this.browserTab.addEventListener('close', this.handleClose);
  settings.addEventListener('change', this.handleSettingChange);
};

Tab.prototype.handleSettingChange = function (evt) {
  console.log(this.constructor.name, 'handleSettingChange', arguments);
  if (evt.key === process.env.TAB_EXPIRATION_KEY &&
      this.expirationTime !== evt.newValue) {
    this.handleExpirationTimeChange(evt.newValue);
  }
};

Tab.prototype.handleExpirationTimeChange = function () {
  console.log(this.constructor.name, 'handleExpirationTimeChange', arguments);
  this.resetTimeout();
};

Tab.prototype.handleClose = function () {
  console.log(this.constructor.name, 'handleClose', arguments);
  this.destroy();
  this.emit('close', this);
};

Tab.prototype.resetTimeout = function () {
  console.log(this.constructor.name, 'resetTimeout', arguments);
  this.stopTimeout();
  var expirationTime = settings.get(process.env.TAB_EXPIRATION_KEY);
  if (exists(expirationTime)) { // could be 0s
    this.timeout = setTimeout(
      this.expire,
      expirationTime);
  }
};

Tab.prototype.stopTimeout = function () {
  console.log(this.constructor.name, 'stopTimeout', arguments);
  if (this.timeout) {
    clearTimeout(this.timeout);
    delete this.timeout;
  }
};

Tab.prototype.expire = function () {
  console.log(this.constructor.name, 'expire', arguments);
  this.stopListening();
  this.expired = true; // must happen before close
  this.close();
  // FIXME: optimization
  // json encode tab vs keeping a ref to actual browser tab
  this.emit('expire', this);
};

Tab.prototype.close = function () {
  console.log(this.constructor.name, 'close', arguments);
  this.browserWindow = this.browserTab.browserWindow;
  this.browserTab.close();
  this.emit('close', this);
};

Tab.prototype.restore = function () {
  console.log(this.constructor.name, 'restore', arguments);
  var openWindows = require('models/open-windows');
  var browserWindowStillOpen =openWindows
    .map(pluck('browserWindow'))
    .find(equals(this.browserWindow));
  if (browserWindowStillOpen) {
    this.browserWindow.insertTab(this.browserTab);
  }
  else {
    var browserWindow = openWindows.openNewWindow();
    browserWindow.insertTab(this.browserTab);
  }
  this.browserTab = null;
  this.browserWindow = null;
};

Tab.prototype.destroy = function () {
  console.log(this.constructor.name, 'destroy', arguments);
  if (this.destroyed) { return; }
  this.destroyed = true;
  this.stopTimeout();
  this.stopListening();
  this.browserTab = null;
  this.browserWindow = null;
  delete this.browserTab;
  this.emit('destroy', this);
};

Tab.prototype.stopListening = function () {
  console.log(this.constructor.name, 'stopListening', arguments);
  this.browserTab.removeEventListener('activate', this.stopTimeout);
  this.browserTab.removeEventListener('deactivate', this.resetTimeout);
  this.browserTab.removeEventListener('close', this.destroy);
  settings.removeEventListener('change', this.handleSettingChange);
};

module.exports = Tab;