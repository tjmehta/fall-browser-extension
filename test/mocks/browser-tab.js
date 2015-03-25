'use strict';

var MockEventTarget = require('mocks/event-target');

function MockBrowserTab (browserWindow) {
  MockEventTarget.call(this);
  var MockBrowserWindow = require('mocks/browser-window');
  this.browserWindow = browserWindow || new MockBrowserWindow();
}

require('util').inherits(MockBrowserTab, MockEventTarget);

module.exports = MockBrowserTab;