/** @jsx React.DOM */
'use strict';
require('config');

var React = require('react');
var TabHistoryPopover = require('views/tab-history-popover.jsx');
var Tabs = require('models/tabs');

var openWindows = require('models/open-windows');
var closedTabs = window.localStorage.closedTabs ?
  new Tabs(JSON.parse(window.localStorage.closedTabs), {dontRemoveOnDestroy:true}) :
  new Tabs([], {dontRemoveOnDestroy:true});

closedTabs.on('add', saveClosedTabs);
closedTabs.on('tab:close', saveClosedTabs);
function saveClosedTabs () {
  window.localStorage.closedTabs = JSON.stringify(closedTabs.toJSON());
}

React.render(
  <TabHistoryPopover
    closedTabs={ closedTabs }
    openWindows={ openWindows } />,
  document.getElementById('popover')
);