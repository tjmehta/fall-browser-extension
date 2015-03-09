/** @jsx React.DOM */
'use strict';
require('config');

var React = require('react');
var TabHistoryPopover = require('views/tab-history-popover.jsx');
var closeTab = new Tabs();

React.render(
  <TabHistoryPopover closeTab={ closeTab } />,
  '#popover'
);