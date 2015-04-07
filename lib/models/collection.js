'use strict';
var EventEmitter = require('events').EventEmitter;
var bindAll = require('bind-all');
var find = require('101/find');
var findIndex = require('101/find-index');
var equals = require('101/equals');
var pluck = require('101/pluck');
var uuid = require('utils/uuid');
var keypather = require('keypather')();

var Collection = function (models, opts) {
  console.log(this.constructor.name, 'Collection', arguments);
  opts = opts || {};
  EventEmitter.call(this);
  var Model = this.Model;
  bindAll(this);
  this.Model = opts.Model || Model;
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
  'every',
  'sort'
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

Collection.prototype.find = function (predicate) {
  return find(this, predicate);
};

Collection.prototype.findIndex = function (predicate) {
  return findIndex(this, predicate);
};

Collection.prototype.sortBy = function (keypath) {
  var multiplier = 1;
  if (keypath[0] === '-') {
    keypath = keypath.slice(1);
    multiplier = -1;
  }
  this.sort(function (tab1, tab2) {
    var timerStart1 = keypather.get(tab1, keypath);
    var timerStart2 = keypather.get(tab2, keypath);
    if (timerStart1 ===  timerStart2) {
      return 0;
    }
    if (!timerStart1) {
      return -1 * multiplier;
    }
    if (!timerStart2) {
      return 1 * multiplier;
    }
    return (timerStart1 < timerStart2) ?
      -1 : ((timerStart1 > timerStart2) ? 1 : 0);
  });
};

Collection.prototype.removeIndex = function (index) {
  console.log(this.constructor.name, 'removeIndex', arguments);
  if (~index) {
    var model = Array.prototype.splice.call(this, index, 1)[0];
    if (model && this.stopListeningToModel) {
      this.stopListeningToModel(model);
    }
    this.emit('remove');
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

Collection.prototype.toJSON = function () {
  return this.map(pluck('toJSON()'));
};

Collection.prototype.toModel = function (model) {
  console.log(this.constructor.name, 'toModel', arguments, (model instanceof this.Model));
  var Model = this.Model;
  return (model instanceof Model) ? model : new Model(model);
};

module.exports = Collection;