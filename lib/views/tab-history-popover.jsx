/** @jsx React.DOM */
'use strict';
require('config');
var pluck = require('101/pluck');
var Tabs = require('models/tabs');
var React = require('react');

var TabHistoryPopover = React.createClass({
  getInitialState: function() {
    return {
      closedTabs: this.props.closedTabs
    };
  },
  listenToOpenWindows: function (windows) {
    windows.on('window:close', this.handleWindowClose);
    windows.map(pluck('tabs')).forEach(this.listenToOpenTabs);
  },
  listenToOpenTabs: function (tabs) {
    tabs.on('tab:close', this.handleTabClose);
  },
  listenToExpiredTabs: function (closedTabs) {
    closedTabs.on('add', this.handleExpiredTabsAdd);
  },
  handleWindowClose: function (window) {
    this.stopListeningToTabs(window.tabs);
  },
  handleTabClose: function (tab) {
    this.closedTabs.push(tab);
  },
  handleExpiredTabsAdd: function (tab) {
    this.$el.append('li');
  },
  stopListeningToTabs: function (tabs) {
    tabs.off('tab:expire', this.handleTabExpire);
  },
  render: function () {
    var closedTabs = this.state.closedTabs;
    return <ul>
      { closedTabs.map(this.tabRow) }
    </ul>;
  },
  tabRow: function (closedTab) {
    return <li>
      <span class="title">
        { closedTab.browserTab.title }
      </span>
      <span>{ closedTab.expired }</span>
    </li>;
  }
});

module.exports = TabHistoryPopover;