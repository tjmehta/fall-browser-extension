'use strict';
require('config');

function Settings () {
  if (safari) {
    this.settings = safari.extension.settings;
  }
}

Settings.prototype.addEventListener = function () {
  var settings = this.settings;

  return settings.addEventListener.apply(settings, arguments);
};

Settings.prototype.removeEventListener = function () {
  var settings = this.settings;
  return settings.removeEventListener.apply(settings, arguments);
};

Settings.prototype.get = function (key) {
  return this.settings[key];
};

Settings.prototype.set = function (key, val) {
  this.settings[key] = val;
  return val;
};

// for tests
Settings.prototype.emit = function (key, val) {
  var evt = {};
  evt.target = 'change';
  evt.key = key;
  evt.newValue = val;
  this.settings[process.env.TAB_EXPIRATION_KEY] = val;
  this.settings.dispatchEvent(evt);
};

module.exports = new Settings();
