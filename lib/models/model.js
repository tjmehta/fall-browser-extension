'use strict';
var bindAll = require('bind-all');
var EventEmitter = require('events').EventEmitter;
var uuid = require('utils/uuid');

function Model () {
  console.log(this.constructor.name, 'Model', arguments);
  bindAll(this);
  this.uuid = uuid();
}

require('util').inherits(Model, EventEmitter);

Model.prototype.super = function (method, args) {
  console.log(this.constructor.name, 'super', arguments);
  Object.getPrototypeOf(this)[method].apply(this, args);
};

Model.prototype.off = Model.prototype.removeListener;

module.exports = Model;