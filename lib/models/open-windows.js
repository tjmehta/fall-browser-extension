'use strict';
var Windows = require('models/windows');

var openBrowserWindows;

if (safari) {
  openBrowserWindows = safari.application.browserWindows;
  safari.application.addEventListener('open', openHandler, false);
}
function openHandler (evt) {
  console.log('openBrowserWindows', 'openHandler', arguments);
  if (evt.target instanceof SafariBrowserWindow) {
    openBrowserWindows.push(evt.target);
  }
}

module.exports = new Windows(openBrowserWindows);