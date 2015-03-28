'use strict';
require('config');

function Settings () {
  console.log(this.constructor.name, 'Settings', arguments);
  if (safari) {
    this.settings = safari.extension.settings;
  }
}

Settings.prototype.addEventListener = function () {
  console.log(this.constructor.name, 'addEventListener', arguments);
  var settings = this.settings;
  return settings.addEventListener.apply(settings, arguments);
};

Settings.prototype.removeEventListener = function () {
  console.log(this.constructor.name, 'removeEventListener', arguments);
  var settings = this.settings;
  return settings.removeEventListener.apply(settings, arguments);
};

Settings.prototype.get = function (key) {
  console.log(this.constructor.name, 'get', arguments);
  return this.settings[key];
};

Settings.prototype.set = function (key, val) {
  console.log(this.constructor.name, 'set', arguments);
  this.settings[key] = val;
  return val;
};

// for tests
Settings.prototype.emit = function (key, val) {
  console.log(this.constructor.name, 'emit', arguments);
  var evt = {};
  evt.target = 'change';
  evt.key = key;
  evt.newValue = val;
  this.settings[process.env.TAB_EXPIRATION_KEY] = val;
  this.settings.dispatchEvent(evt);
};

module.exports = new Settings();
