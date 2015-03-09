'use strict';
var Windows = require('models/windows');

var openBrowserWindows;

if (safari) {
  openBrowserWindows = safari.application.browserWindows;
}

module.exports = new Windows(openBrowserWindows);