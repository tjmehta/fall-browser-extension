'use strict';

var MockEventTarget = require('mocks/event-target');

function MockBrowserTab () {
  MockEventTarget.call(this);
  this.browserWindow = new MockEventTarget();
}

require('util').inherits(MockBrowserTab, MockEventTarget);

module.exports = MockBrowserTab;