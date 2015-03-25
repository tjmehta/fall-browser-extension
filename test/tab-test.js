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

var Tab = require('models/tab');
var MockBrowserTab = require('mocks/browser-tab');

describe('tab', function () {
  var ctx;

  beforeEach(function (done) {
    ctx = {};
    settings.set(process.env.TAB_EXPIRATION_KEY, 1000*1000); // 1000sec
    ctx.settingsAddListener    = settings.addEventListener;
    ctx.settingsRemoveListener = settings.removeEventListener;
    done();
  });
  afterEach(function (done) {
    ctx.tab.destroy();
    settings.addEventListener    = ctx.settingsAddListener; // restore if spy was used
    settings.removeEventListener = ctx.settingsRemoveListener; // restore if spy was used
    delete global.safari;
    done();
  });

  describe('constructor', function () {
    it('should attach all event handlers', function (done) {
      var mockBrowserTab = new MockBrowserTab();
      // set up spies
      var spy = mockBrowserTab.addEventListener = sinon.spy();
      var spy2 = settings.addEventListener = sinon.spy();
      // init tab
      var tab = ctx.tab = new Tab(mockBrowserTab);
      // verify init state
      expect(tab.time.opened).to.exist();
      expect(tab.browserTab).to.equal(mockBrowserTab);
      // added tab event listeners
      expect(spy.called).to.be.true();
      expect(spy.callCount).to.equal(3);
      var events = [
        spy.firstCall.args[0],
        spy.secondCall.args[0],
        spy.thirdCall.args[0]
      ];
      expect(events).to.include(['activate', 'deactivate', 'close']);
      // added settings event listeners
      expect(spy2.called).to.be.true();
      expect(spy2.callCount).to.equal(1);
      expect(spy2.firstCall.args[0]).to.equal('change');
      done();
    });
  });

  describe('isActive', function () {
    beforeEach(function (done) {
      ctx.mockBrowserTab = new MockBrowserTab();
      ctx.tab = new Tab(ctx.mockBrowserTab);
      done();
    });
    describe('tab is active', function () {
      beforeEach(function (done) {
        ctx.mockBrowserTab.browserWindow.activeTab = ctx.mockBrowserTab;
        done();
      });
      it('should return true', function (done) {
        expect(ctx.tab.isActive()).to.equal(true);
        done();
      });
    });
    describe('tab is inactive', function () {
      beforeEach(function (done) {
        ctx.mockBrowserTab.browserWindow.activeTab = new MockBrowserTab();
        done();
      });
      it('should return false', function (done) {
        expect(ctx.tab.isActive()).to.equal(false);
        done();
      });
    });
  });

  describe('timeout', function () {
    beforeEach(function (done) {
      settings.set(process.env.TAB_EXPIRATION_KEY, 30); // 30ms
      ctx.mockBrowserTab = new MockBrowserTab();
      // noop addListeners bc removeListeners are being replaced with spies below
      ctx.mockBrowserTab.addEventListener = noop;
      settings.addEventListener = noop;
      // init tab
      ctx.tab = new Tab(ctx.mockBrowserTab);
      done();
    });
    it('should expire', function (done) {
      // set up spies
      var spy = ctx.mockBrowserTab.removeEventListener = sinon.spy();
      var spy2 = settings.removeEventListener = sinon.spy();
      ctx.tab.once('expire', function () {
        // removed tab event listeners
        expect(spy.called).to.be.true();
        expect(spy.callCount).to.equal(3);
        var events = [
          spy.firstCall.args[0],
          spy.secondCall.args[0],
          spy.thirdCall.args[0]
        ];
        expect(events).to.include(['activate', 'deactivate', 'close']);
        // removed settings event listeners
        expect(spy2.called).to.be.true();
        expect(spy2.callCount).to.equal(1);
        expect(spy2.firstCall.args[0]).to.equal('change');
        done();
      });
    });
  });

  describe('events', function () {
    beforeEach(function (done) {
      ctx.mockBrowserTab = new MockBrowserTab();
      ctx.tab = new Tab(ctx.mockBrowserTab);
      done();
    });
    describe('settings', function() {
      describe('tab-expiration-time change', function () {
        it('should reset timeout', function (done) {
          var timeout1 = ctx.tab.timeout;
          settings.emit(process.env.TAB_EXPIRATION_KEY, 10);
          expect(ctx.tab.timeout).to.not.equal(timeout1);
          ctx.tab.once('expire', function () {
            done();
          });
        });
      });
    });
    describe('tab', function () {
      describe('activate', function() {
        beforeEach(function (done) {
          ctx.clearTimeout = clearTimeout;
          done();
        });
        afterEach(function (done) {
          clearTimeout = ctx.clearTimeout;
          done();
        });
        it('should stop timeout', function(done) {
          var spy = global.clearTimeout = sinon.spy();
          var evt = {
            target: 'activate'
          };
          var timeoutId = ctx.tab.timeout;
          ctx.mockBrowserTab.dispatchEvent(evt);
          expect(ctx.tab.timeout).to.be.undefined();
          expect(spy.called).to.be.true();
          expect(spy.callCount).to.equal(1);
          expect(spy.firstCall.args[0]).to.equal(timeoutId);
          done();
        });
      });
      describe('deactivate', function () {
        it('should reset the timeout', function (done) {
          var timeout1 = ctx.tab.timeout;
          var evt = {
            target: 'deactivate'
          };
          ctx.mockBrowserTab.dispatchEvent(evt);
          expect(ctx.tab.timeout).to.not.equal(timeout1);
          done();
        });
      });
      describe('close', function () {
        it('should destroy the tab', function (done) {
          var evt = {
            target: 'close'
          };
          // set up spies
          var spy = ctx.mockBrowserTab.removeEventListener = sinon.spy();
          var spy2 = settings.removeEventListener = sinon.spy();
          // dispatch event
          ctx.mockBrowserTab.dispatchEvent(evt);
          // verify destroyed state
          expect(ctx.tab.timeout).to.be.undefined();
          // removed tab event listeners
          expect(spy.called).to.be.true();
          expect(spy.callCount).to.equal(3);
          var events = [
            spy.firstCall.args[0],
            spy.secondCall.args[0],
            spy.thirdCall.args[0]
          ];
          expect(events).to.include(['activate', 'deactivate', 'close']);
          // removed settings event listeners
          expect(spy2.called).to.be.true();
          expect(spy2.callCount).to.equal(1);
          expect(spy2.firstCall.args[0]).to.equal('change');
          done();
        });
      });
    });
  });
});