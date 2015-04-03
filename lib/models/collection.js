'use strict';
var EventEmitter = require('events').EventEmitter;
var bindAll = require('bind-all');
var findIndex = require('101/find-index');
var equals = require('101/equals');
var uuid = require('utils/uuid');

var Collection = function () {
  console.log(this.constructor.name, 'Collection', arguments);
  EventEmitter.call(this);
  var Model = this.Model;
  bindAll(this);
  this.Model = Model;
  this.uuid = uuid();
  this.length = 0;
};

require('util').inherits(Collection, EventEmitter);

[
  'forEach',
  'filter',
  'map',
  'reduce',
  'some',
  'every'
].forEach(function (method) {
  Collection.prototype[method] = function () {
    console.log(this.constructor.name, method, arguments);
    return Array.prototype[method].apply(this, arguments);
  };
});

Collection.prototype.super = function (method, args) {
  console.log(this.constructor.name, 'super', arguments);
  return Object.getPrototypeOf(this)[method].apply(this, args);
};

[
  'push',
  'unshift'
].forEach(function (method) {
  Collection.prototype[method] = function (model) {
    console.log(this.constructor.name, method, arguments);
    model = this.toModel(model);
    if (this.listenToModel) {
      this.listenToModel(model);
    }
    console.log(this.constructor.name, 'before', method, this.length);
    Array.prototype[method].call(this, model);
    console.log(this.constructor.name, 'after', method, this.length);
    this.emit('add', model);
  };
});

// Note: slice could be confusing..
// Collection.prototype.slice = function () {
//   return new this.constructor(this.toArray.apply(this, arguments));
// };

Collection.prototype.splice = function () {
  console.log(this.constructor.name, 'splice', arguments);
  var arr = this.toArray();
  var ret = arr.splice.apply(arr, arguments);
  ret.forEach(this.remove);
  return ret;
};

Collection.prototype.removeIndex = function (index) {
  console.log(this.constructor.name, 'removeIndex', arguments);
  if (~index) {
    var model = Array.prototype.splice.call(this, index, 1)[0];
    if (model && this.stopListeningToModel) {
      this.stopListeningToModel(model);
    }
    return model;
  }
};

Collection.prototype.remove = function (modelOrPredicate) {
  console.log(this.constructor.name, 'remove', arguments);
  var predicate = (modelOrPredicate instanceof this.Model) ?
    equals(modelOrPredicate) : // model
    modelOrPredicate;
  return this.removeIndex(findIndex(this, predicate));
};

Collection.prototype.toArray = function () {
  console.log(this.constructor.name, 'toArray', arguments);
  return Array.prototype.slice.call(this, arguments);
};

Collection.prototype.toModel = function (model) {
  console.log(this.constructor.name, 'toModel', arguments, (model instanceof this.Model));
  var Model = this.Model;
  return (model instanceof Model) ? model : new Model(model);
};

module.exports = Collection;