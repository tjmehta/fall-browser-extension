'use strict';

var Collection  = require('models/collection');
var Tab         = require('models/tab');

function Tabs (tabs) {
  console.log(this.constructor.name, 'Tabs', arguments);
  Collection.call(this);
  tabs = tabs || [];
  console.log(tabs.length);
  console.log(tabs.length);
  console.log(tabs.length);
  tabs.forEach(this.push.bind(this));
  this.stopListeningMap = {};
}

require('util').inherits(Tabs, Collection);

Tabs.prototype.Model = Tab;

Tabs.prototype.listenToModel = function (tab) {
  console.log(this.constructor.name, 'listenToModel', arguments);
  tab.on('destroy', this.handleTabDestroy);
  tab.on('expire',  this.handleTabExpire);
  tab.on('close',   this.handleTabClose);
};

Tabs.prototype.handleTabDestroy = function (tab) {
  console.log(this.constructor.name, 'handleTabDestroy', arguments);
  this.remove(tab);
  this.emit('tab:destroy', tab);
};

Tabs.prototype.handleTabExpire = function (tab) {
  console.log(this.constructor.name, 'handleTabExpire', arguments);
  this.emit('tab:expire', tab);
};

Tabs.prototype.handleTabClose = function (tab) {
  console.log(this.constructor.name, 'handleTabClose', arguments);
  this.remove(tab);
  this.emit('tab:close', tab);
};

Tabs.prototype.stopListeningToModel = function (tab) {
  console.log(this.constructor.name, 'stopListeningToModel', arguments);
  tab.off('expire', this.handleTabExpire);
  tab.off('close', this.handleTabClose);
};

module.exports = Tabs;