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
var createCount = require('callback-count');

var Window = require('models/window');
var MockBrowserWindow = require('mocks/browser-window');

describe('window', function () {
  var ctx;

  beforeEach(function (done) {
    ctx = {};
    ctx.mockBrowserWindow = new MockBrowserWindow();
    ctx.mockBrowserWindow.createMockBrowserTabs(3);
    done();
  });
  afterEach(function (done) {
    ctx.win.destroy();
    done();
  });

  describe('constructor', function () {
    it('should create tab collection', function (done) {
      var mockBrowserWindow = ctx.mockBrowserWindow;
      // set up spies
      var spy = sinon.stub(mockBrowserWindow, 'addEventListener');
      // init window
      var win = ctx.win = new Window(mockBrowserWindow);
      expect(win.tabs).to.exist();
      expect(win.tabs.length).to.equal(3);
      expect(win.browserWindow).to.exist();
      expect(spy.called).to.be.true();
      expect(spy.callCount).to.equal(1);
      var events = [
        spy.firstCall.args[0],
      ];
      expect(events).to.include(['close']);
      spy.restore();
      done();
    });
  });

  describe('window instance', function() {
    beforeEach(function (done) {
      ctx.win = new Window(ctx.mockBrowserWindow);
      done();
    });

    describe('destroy', function () {
      it('should stopListening and destroy all tabs', function (done) {
        var win = ctx.win;
        var windowRemoveListenerSpy = sinon.stub(ctx.mockBrowserWindow, 'removeEventListener');
        var tabDestroySpies = win.tabs.map(function (tab) {
          return sinon.stub(tab, 'destroy');
        });
        win.once('destroy', function () {
          expect(windowRemoveListenerSpy.calledOnce).to.be.true();
          expect(windowRemoveListenerSpy.firstCall.args[0]).to.equal('close');
          expect(tabDestroySpies.length).to.equal(3);
          tabDestroySpies.forEach(function (spy) {
            expect(spy.calledOnce).to.be.true();
            spy.restore();
          });
          done();
        });
        win.destroy();
      });
    });

    describe('events', function () {
      describe('window close', function () {
        it('should call destroy', function (done) {
          var win = ctx.win;
          var spy = sinon.stub(win, 'destroy');
          win.once('close', function () {
            expect(spy.calledOnce).to.be.true();
            spy.restore();
            done();
          });
          ctx.mockBrowserWindow.emit('close', { target: 'close' });
        });
      });
    });
  });
});