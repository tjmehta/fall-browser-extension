'use strict';
require('mocks/safari-extension-settings');
require('config');

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var expect = Code.expect;
var sinon = require('sinon');
var settings = require('models/settings');
var noop = require('101/noop');

var Window = require('models/window');
var MockBrowserWindow = require('mocks/browser-window');

describe('window', function () {
  var ctx;

  beforeEach(function (done) {
    ctx = {};
  });
  afterEach(function (done) {
    ctx.win.destroy();
    ctx.mockBrowserWindow.addEventListener.restore();
    done();
  });

  describe('constructor', function () {
    it('should create tab collection', function (done) {
      var mockBrowserWindow =
        ctx.mockBrowserWindow =
        new MockBrowserWindow();
      // set up spies
      sinon.stub(mockBrowserWindow, 'addEventListener');
      // init window
      mockBrowserWindow.createMockBrowserTab();
      var win = ctx.win = new Window(mockBrowserWindow);
      var spy = mockBrowserWindow.addEventListener;
      expect(win.tabs).to.exist();
      // TODO: more tabs expectations
      expect(win.mockBrowserWindow).to.exist();
      expect(spy.called).to.be.true();
      expect(spy.callCount).to.equal(1);
      var events = [
        spy.firstCall.args[0],
      ];
      expect(events).to.include(['close']);
      done();
    });
  });

});