'use strict';
require('config');

var settingsPlistStr = require('fs')
  .readFileSync(__dirname + '/../../dist/Fall.safariextension/Settings.plist')
  .toString();
var settingsConfig = require('index-by')(
  require('plist').parse(settingsPlistStr),
  'Key'
);

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

Settings.prototype.default = function (key) {
  console.log(this.constructor.name, 'default', arguments);
  return settingsConfig[key].DefaultValue;
};

Settings.prototype.max = function (key) {
  console.log(this.constructor.name, 'max', arguments, settingsConfig);
  var val = settingsConfig[key].MaximumValue;
  return val;
};

Settings.prototype.min = function (key) {
  console.log(this.constructor.name, 'min', arguments);
  return settingsConfig[key].MinimumValue;
};

Settings.prototype.hash = function (key) {
  console.log(this.constructor.name, 'hash', arguments);
  var self = this;
  var hash = ['default', 'max', 'min'].reduce(function (hash, valKey) {
    hash[valKey] = self[valKey](key);
    return hash;
  }, {});
  hash.val = self.get(key);
  return hash;
};

Settings.prototype.all = function () {
  console.log(this.constructor.name, 'all', arguments);
  var self = this;

  var all = [
    process.env.TAB_EXPIRATION_KEY,
    process.env.MAX_TABS
  ].reduce(function (all, key) {
    all[key] = self.hash(key);
    return all;
  }, {});
  all[process.env.TAB_EXPIRATION_KEY].units   = 'minutes';
  all[process.env.MAX_TABS].units = 'tabs';

  return all;
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
