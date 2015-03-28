/** @jsx React.DOM */
'use strict';
require('config');
var pluck = require('101/pluck');
var React = require('react');

var TabHistoryPopover = React.createClass({
  getInitialState: function () {
    console.log('getInitialState', arguments);
    this.listenToOpenWindows(this.props.openWindows);
    return {
      closedTabs: this.props.closedTabs
    };
  },
  listenToOpenWindows: function (windows) {
    console.log('listenToOpenWindows', arguments);
    windows.on('window:close', this.handleWindowClose);
    windows.map(pluck('tabs')).forEach(this.listenToOpenTabs);
  },
  listenToOpenTabs: function (tabs) {
    console.log('listenToOpenTabs', arguments);
    tabs.on('tab:close', this.handleTabClose);
  },
  listenToExpiredTabs: function (closedTabs) {
    console.log('listenToExpiredTabs', arguments);
    closedTabs.on('add', this.handleExpiredTabsAdd);
  },
  handleWindowClose: function (window) {
    console.log('handleWindowClose', arguments);
    this.stopListeningToTabs(window.tabs);
  },
  handleTabClose: function (tab) {
    console.log('handleTabClose', arguments);
    this.closedTabs.push(tab);
  },
  handleExpiredTabsAdd: function (tab) {
    console.log('handleExpiredTabsAdd', arguments);
    this.$el.append('li');
  },
  stopListeningToTabs: function (tabs) {
    console.log('stopListeningToTabs', arguments);
    tabs.off('tab:close', this.handleWindowClose);
  },
  render: function () {
    console.log('render', arguments);
    var closedTabs = this.state.closedTabs;
    return closedTabs.length ?
      <ul>{ closedTabs.map(this.tabRow) }</ul> :
      <span> No closed or expired tabs. </span>
  },
  tabRow: function (closedTab) {
    console.log('tabRow', arguments);
    return <li>
      <span class="title">
        { closedTab.browserTab.title }
      </span>
      <span>{ closedTab.expired }</span>
    </li>;
  }
});

module.exports = TabHistoryPopover;