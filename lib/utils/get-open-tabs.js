'use strict';

module.exports = getOpenTabs;

function getOpenTabs () {
  if (typeof safari !== 'undefined') {
    return browserWindow.tabs;
  }
};