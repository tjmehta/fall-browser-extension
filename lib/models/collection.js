'use strict';
var EventEmitter = require('events').EventEmitter;
var findIndex = require('101/find-index');
var equals = require('101/equals');

var Collection = function () {
  EventEmitter.call(this);
  this.length = 0;
};

require('util').inherits(Collection, EventEmitter);

[
  'forEach',
  'filter',
  'map',
  'reduce',
  'push',
  'splice',
  'slice'
].forEach(function (method) {
  Collection.prototype[method] = function () {
    return Array.prototype[method].apply(this, arguments);
  };
});

Collection.prototype.super = function (method, args) {
  return Object.getPrototypeOf(this)[method].apply(this, args);
};

Collection.prototype.push = function (model) {
  model = this.toModel(model);
  if (this.listenToModel) {
    this.listenToModel(model);
  }
  Array.prototype.push.apply(this, arguments);
};

Collection.prototype.remove = function (model) {
  var index = findIndex(this, equals(model));
  model = this.splice(index, 1)[0];
  if (model && this.stopListeningToModel) {
    this.stopListeningToModel(model);
  }
};

Collection.prototype.toModel = function (model) {
  var Model = this.Model;
  return (model instanceof Model) ? model : new Model(model);
};

module.exports = Collection;