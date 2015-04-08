/** @jsx React.DOM */
'use strict';
require('config');

var React = require('react');
var TabHistoryPopover = require('views/tab-history-popover.jsx');
var Tabs = require('models/tabs');

window.openWindows = require('models/open-windows');
window.closedTabs = window.localStorage.closedTabs ?
  new Tabs(JSON.parse(window.localStorage.closedTabs), {dontRemoveOnDestroy:true}) :
  new Tabs([], {dontRemoveOnDestroy:true});

closedTabs.on('add', saveClosedTabs);
closedTabs.on('tab:close', saveClosedTabs);
function saveClosedTabs () {
  window.localStorage.closedTabs = JSON.stringify(closedTabs.toJSON());
}

React.render(
  <TabHistoryPopover
    closedTabs={ window.closedTabs }
    openWindows={ window.openWindows } />,
  document.getElementById('popover')
);