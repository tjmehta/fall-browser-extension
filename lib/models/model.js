'use strict';
var bindAll = require('bind-all');
var EventEmitter = require('events').EventEmitter;
var uuid = 0;

function Model () {
  bindAll(this);
  this.uuid = uuid;
  uuid++;
}

require('util').inherits(Model, EventEmitter);

Model.prototype.super = function (method, args) {
  Object.getPrototypeOf(this)[method].apply(this, args);
};

module.exports = Model;