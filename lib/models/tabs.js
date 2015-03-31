'use strict';

var Collection  = require('models/collection');
var Tab         = require('models/tab');

function Tabs (tabs, opts) {
  console.log(this.constructor.name, 'Tabs', arguments);
  Collection.call(this);
  tabs = tabs || [];
  tabs.forEach(this.push);
  this.opts = opts || {};
  this.stopListeningMap = {};
}

require('util').inherits(Tabs, Collection);

Tabs.prototype.Model = Tab;

Tabs.prototype.listenToModel = function (tab) {
  console.log(this.constructor.name, 'listenToModel', arguments);
  tab.on('close',   this.handleTabClose);
  tab.on('destroy', this.handleTabDestroy);
};

Tabs.prototype.handleTabDestroy = function (tab) {
  console.log(this.constructor.name, 'handleTabDestroy', arguments);
  if (!this.opts.dontRemoveOnDestroy) {
    this.remove(tab);
  }
  this.emit('tab:destroy', tab);
};

Tabs.prototype.handleTabClose = function (tab) {
  console.log(this.constructor.name, 'handleTabClose', arguments);
  this.remove(tab);
  this.emit('tab:close', tab);
};

Tabs.prototype.stopListeningToModel = function (tab) {
  console.log(this.constructor.name, 'stopListeningToModel', arguments);
  tab.off('close', this.handleTabClose);
  tab.off('destroy', this.handleTabDestroy);
};

module.exports = Tabs;