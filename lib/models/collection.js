'use strict';
var EventEmitterClone = require('101/clone')(require('events').EventEmitter);
var findIndex = require('101/find-index');
var equals = require('101/equals');

var Collection = EventEmitterClone;

Collection.prototype.super = function (method, args) {
  return Object.getPrototypeOf(this)[method].apply(this, args);
};

Collection.prototype.push = function (model) {
  model = this.toModel(model);
  if (this.listenToModel) {
    this.listenToModel(model);
  }
  this.super('push', [model]);
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

require('util').inherits(Collection, Array);

module.exports = Collection;