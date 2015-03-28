/** @jsx React.DOM */
'use strict';
require('config');
var pluck = require('101/pluck');
var React = require('react');

var TabHistoryPopover = React.createClass({
  getInitialState: function () {
    console.log('TabHistoryPopover', 'getInitialState', arguments);
    this.listenToOpenWindows(this.props.openWindows);
    return {
      closedTabs: this.props.closedTabs
    };
  },
  listenToOpenWindows: function (windows) {
    console.log('TabHistoryPopover', 'listenToOpenWindows', arguments);
    windows.on('window:close', this.handleWindowClose);
    windows.map(pluck('tabs')).forEach(this.listenToOpenTabs);
  },
  listenToOpenTabs: function (tabs) {
    console.log('TabHistoryPopover', 'listenToOpenTabs', arguments);
    tabs.on('tab:close', this.handleTabClose);
  },
  listenToExpiredTabs: function (closedTabs) {
    console.log('TabHistoryPopover', 'listenToExpiredTabs', arguments);
    closedTabs.on('add', this.handleExpiredTabsAdd);
  },
  handleWindowClose: function (window) {
    console.log('TabHistoryPopover', 'handleWindowClose', arguments);
    this.stopListeningToTabs(window.tabs);
  },
  handleTabClose: function (tab) {
    console.log('TabHistoryPopover', 'handleTabClose', arguments);
    this.closedTabs.push(tab);
    this.setState({
      closedTabs: this.closedTabs
    });
  },
  handleExpiredTabsAdd: function (tab) {
    console.log('TabHistoryPopover', 'handleExpiredTabsAdd', arguments);
    this.$el.append('li');
  },
  stopListeningToTabs: function (tabs) {
    console.log('TabHistoryPopover', 'stopListeningToTabs', arguments);
    tabs.off('tab:close', this.handleWindowClose);
  },
  render: function () {
    console.log('TabHistoryPopover', 'render', arguments);
    var closedTabs = this.state.closedTabs;
    return <ul>
      {
        closedTabs.length ?
          closedTabs.map(this.tabRow) :
          'No closed or expired tabs'
      }
      </ul>;
  },
  tabRow: function (closedTab) {
    console.log('TabHistoryPopover', 'tabRow', arguments);
    return <li>
      <span class="title">
        { closedTab.browserTab.title }
      </span>
      <span>{ closedTab.expired }</span>
    </li>;
  }
});

module.exports = TabHistoryPopover;