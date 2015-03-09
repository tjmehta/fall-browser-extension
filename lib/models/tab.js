'use strict';
var Model = require('models/model');
var settings = require('models/settings');
var exists = require('101/exists');
require('config');
var uuid = 0;

function Tab (browserTab) {
  Model.call(this);
  this.uuid = uuid++;
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
  return this.browserTab[key];
};

Tab.prototype.getUrl = function () {

};

Tab.prototype.isActive = function () {
  return this.browserTab === this.browserTab.browserWindow.activeTab;
};

Tab.prototype.listen = function () {
  this.browserTab.addEventListener('activate', this.stopTimeout);
  this.browserTab.addEventListener('deactivate', this.resetTimeout);
  this.browserTab.addEventListener('close', this.handleClose);
  settings.addEventListener('change', this.handleSettingChange);
};

Tab.prototype.handleSettingChange = function (evt) {
  if (evt.key === process.env.TAB_EXPIRATION_KEY &&
      this.expirationTime !== evt.newValue) {
    this.handleExpirationTimeChange(evt.newValue);
  }
};

Tab.prototype.handleExpirationTimeChange = function () {
  this.resetTimeout();
};

Tab.prototype.handleClose = function () {
  this.destroy();
  this.emit('close', this);
};

Tab.prototype.resetTimeout = function () {
  this.stopTimeout();
  var expirationTime = settings.get(process.env.TAB_EXPIRATION_KEY);
  if (exists(expirationTime)) { // could be 0s
    this.timeout = setTimeout(
      this.expire,
      expirationTime);
  }
};

Tab.prototype.stopTimeout = function () {
  if (this.timeout) {
    clearTimeout(this.timeout);
    delete this.timeout;
  }
};

Tab.prototype.expire = function () {
  this.stopListening();
  this.expired = true; // must happen before close
  this.close();
  // FIXME: optimization
  // json encode tab vs keeping a ref to actual browser tab
  this.emit('expire', this);
};

Tab.prototype.close = function () {
  // close
};

Tab.prototype.restore = function () {
  this.listen();
};

Tab.prototype.destroy = function () {
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
  this.browserTab.removeEventListener('activate', this.stopTimeout);
  this.browserTab.removeEventListener('deactivate', this.resetTimeout);
  this.browserTab.removeEventListener('close', this.destroy);
  settings.removeEventListener('change', this.handleSettingChange);
};

module.exports = Tab;