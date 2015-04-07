'use strict';
var hasProps = require('101/has-properties');
var pluck = require('101/pluck');
var Model = require('./model');
var settings = require('models/settings');
var Tabs = require('models/tabs');

function Window (browserWindow) {
  console.log(this.constructor.name, 'Window', arguments);
  Model.call(this);
  this.setTabs(browserWindow);
  this.browserWindow = browserWindow;
  this.listen();
}

require('util').inherits(Window, Model);

// made this a function for future browser compatibility
Window.prototype.setTabs = function (browserWindow) {
  console.log(this.constructor.name, 'setTabs', arguments);
  this.tabs = new Tabs(browserWindow.tabs);
};

Window.prototype.listen = function () {
  console.log(this.constructor.name, 'listen', arguments);
  this.browserWindow.addEventListener('close', this.handleClose);
  settings.addEventListener('change', this.handleSettingChange);
};

Window.prototype.handleClose = function () {
  console.log(this.constructor.name, 'handleClose', arguments);
  this.destroy();
  this.emit('close', this);
};

Window.prototype.handleSettingChange = function (evt) {
  console.log(this.constructor.name, 'handleSettingChange', arguments);
  if (evt.key === process.env.MIN_TABS_PER_WINDOW) {
    this.handleMinTabsChange(evt.newValue);
  }
};

Window.prototype.handleMinTabsChange = function (minTabs) {
  console.log(this.constructor.name, 'handleMinTabsChange', arguments);
  var openWindows = require('models/open-windows');
  var win = openWindows.find(hasProps({ browserWindow: this.browserWindow }));
  var tabsToClose = win.tabs.length - minTabs;
  if (tabsToClose > 0) {
    // TODO: use lazy.js
    this.tabs
      .filter(hasProps({ expired: true }))
      .sortBy('-time.timerStart')
      .slice(0, tabsToClose)
      .forEach(pluck('close()'));
  }
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
  settings.removeEventListener('change', this.handleSettingChange);
};

module.exports = Window;