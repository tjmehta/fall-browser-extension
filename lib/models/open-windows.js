'use strict';
var Windows = require('models/windows');
var openTabEvent = require('events/open-tab');
var openWindowEvent = require('events/open-window');
var equals = require('101/equals');
var pluck  = require('101/pluck');
var findIndex = require('101/find-index');

var openBrowserWindows;

if (safari) {
  openBrowserWindows = safari.application.browserWindows;
}

// on open tab
openTabEvent.on(function (evt) {
  console.log('openTabs', 'openTabEventHandler', arguments);
  var browserTab = evt.target;
  var browserWindow = browserTab.browserWindow;
  var index = findIndex(
    openBrowserWindows.map(pluck('browserWindow')),
    equals(browserWindow)
  );
  if (~index) {
    openBrowserWindows.tabs.push(browserTab);
  }
  else {
    console.log('browser window not found???');
  }
});

// on open window
openWindowEvent.on(function (evt) {
  console.log('openWindows', 'openWindowEventHandler', arguments);
  var browserWindow = evt.target;
  openBrowserWindows.push(browserWindow);
});

module.exports = window.openWindows = new Windows(openBrowserWindows);