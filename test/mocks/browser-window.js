'use strict';

var MockEventTarget = require('mocks/event-target');

function MockBrowserWindow () {
  MockEventTarget.call(this);
}

require('util').inherits(MockBrowserWindow, MockEventTarget);

module.exports = MockBrowserWindow;