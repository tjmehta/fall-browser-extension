'use strict';

var MockEventTarget = require('mocks/event-target');
var isNumber = require('101/is-number');

function MockBrowserWindow (tabs) {
  MockEventTarget.call(this);
  this.tabs = tabs || [];
}

require('util').inherits(MockBrowserWindow, MockEventTarget);

MockBrowserWindow.prototype.createMockBrowserTabs = function (numTabs) {
  console.log(this.constructor.name, 'createMockBrowserTabs', arguments);
  if (!isNumber(numTabs) || numTabs < 0) {
    return;
  }
  while (numTabs) {
    this.createMockBrowserTab();
    numTabs--;
  }
};

MockBrowserWindow.prototype.createMockBrowserTab = function () {
  console.log(this.constructor.name, 'createMockBrowserTab');
  var MockBrowserTab = require('mocks/browser-tab');
  var mockBrowserTab = new MockBrowserTab(this);
  this.tabs.push(mockBrowserTab);
};

module.exports = MockBrowserWindow;