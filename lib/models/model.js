'use strict';
var bindAll = require('bind-all');
var EventEmitter = require('events').EventEmitter;

function Model () {
  bindAll(this);
}

require('util').inherits(Model, EventEmitter);

Model.prototype.super = function (method, args) {
  Object.getPrototypeOf(this)[method].apply(this, args);
};

module.exports = Model;