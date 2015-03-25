'use strict';

var Collection  = require('models/collection');
var Tab         = require('models/tab');

function Tabs (tabs) {
  Collection.call(this);
  tabs = tabs || [];
  tabs.forEach(this.push.bind(this));
  this.stopListeningMap = {};
}

require('util').inherits(Tabs, Collection);

Tabs.prototype.Model = Tab;

Tabs.prototype.listenToModel = function (tab) {
  tab.on('destroy', this.handleTabExpire);
  tab.on('expire',  this.handleTabExpire);
  tab.on('close',   this.handleTabClose);
};

Tabs.prototype.handleTabExpire = function (tab) {
  this.emit('tab:expire', tab);
};

Tabs.prototype.handleTabClose = function (tab) {
  this.remove(tab);
  this.emit('tab:close', tab);
};

Tabs.prototype.stopListeningToModel = function (tab) {
  tab.off('expire', this.handleTabClose);
  tab.off('close', this.handleTabExpire);
};

module.exports = Tabs;