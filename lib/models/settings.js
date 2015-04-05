'use strict';
require('config');
var indexBy = require('index-by');
var bindAll = require('bind-all');

var settingsPlistStr = require('fs')
  .readFileSync(__dirname + '/../../dist/Fall.safariextension/Settings.plist')
  .toString();
var settingsConfig = require('index-by')(
  require('plist').parse(settingsPlistStr),
  'Key'
);

function Settings () {
  console.log(this.constructor.name, 'Settings', arguments);
  bindAll(this);
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

Settings.prototype.slider = function (key) {
  console.log(this.constructor.name, 'slider', arguments);
  var self = this;
  var hash = ['default', 'max', 'min'].reduce(function (hash, valKey) {
    hash[valKey] = self[valKey](key);
    return hash;
  }, {});
  hash.key = key;
  hash.val = self.get(key);
  hash.type = 'slider';
  hash.units = /time/i.test(key) ? 'minutes' : 'tabs';
  return hash;
};

Settings.prototype.bool = function (key) {
  console.log(this.constructor.name, 'bool', arguments);
  var self = this;
  var hash = ['default'].reduce(function (hash, valKey) {
    hash[valKey] = self[valKey](key);
    return hash;
  }, {});
  hash.key = key;
  hash.val = self.get(key);
  hash.type = 'bool';
  return hash;
};

Settings.prototype.all = function () {
  console.log(this.constructor.name, 'all', arguments);
  var self = this;
  var sliders = [
    process.env.TAB_EXPIRATION_KEY,
    process.env.MIN_TABS_PER_WINDOW,
    process.env.MAX_TABS
  ];
  var bools = [ process.env.ENABLED ];
  // get vals
  var all = sliders.map(self.slider);
  all = all.concat(bools.map(self.bool));
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
