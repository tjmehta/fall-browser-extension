'use strict';

module.exports = getOpenTabs;

function getOpenTabs () {
  if (safari) {
    return browserWindow.tabs;
  }
};