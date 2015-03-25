/** @jsx React.DOM */
'use strict';
require('config');

var React = require('react');
var TabHistoryPopover = require('views/tab-history-popover.jsx');
var Tabs = require('models/tabs');

var openWindows = require('models/open-windows');
var closedTabs = new Tabs();

React.render(
  <TabHistoryPopover
    closedTabs={ closedTabs }
    openWindows={ openWindows } />,
  document.getElementById('popover')
);