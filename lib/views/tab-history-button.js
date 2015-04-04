'use strict';
var bindAll = require('bind-all');

function TabHistoryButton () {
  bindAll(this);
}

TabHistoryButton.prototype.listen = function () {
  safari.application.addEventListener('validate', this.validateHandler, true);
  safari.application.addEventListener('popover', this.popoverHandler, true);
};

TabHistoryButton.prototype.validateHandler = function () {
  return;
};

TabHistoryButton.prototype.popoverHandler = function () {
  return;
};

TabHistoryButton.prototype.stopListening = function () {
  safari.application.removeEventListener('validate', this.validateHandler);
  safari.application.removeEventListener('popover', this.popoverHandler);
};

module.exports = TabHistoryButton;