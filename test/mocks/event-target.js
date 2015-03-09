'use strict';
var EventEmitter = require('events').EventEmitter;

function MockEventTarget () {
  EventEmitter.call(this);
}

require('util').inherits(MockEventTarget, EventEmitter);

MockEventTarget.prototype.addEventListener    = function () {
  return this.addListener.apply(this, arguments);
};

MockEventTarget.prototype.dispatchEvent = function (evt) {
  return this.emit.call(this, evt.target, evt);
};

MockEventTarget.prototype.removeEventListener = function () {
  return this.removeListener.apply(this, arguments);
};

module.exports = MockEventTarget;