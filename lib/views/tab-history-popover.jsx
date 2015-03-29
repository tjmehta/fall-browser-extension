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
    windows.on('add', this.handleNewWindow);
    windows.on('window:close', this.handleTabClose);
    windows.map(pluck('tabs')).forEach(this.listenToOpenTabs);
  },
  listenToOpenTabs: function (tabs) {
    console.log('TabHistoryPopover', 'listenToOpenTabs', arguments);
    tabs.on('tab:close', this.handleTabClose);
  },
  handleNewWindow: function (window) {
    console.log('TabHistoryPopover', 'handleNewWindow', arguments);
    this.listenToOpenTabs(window.tabs);
  },
  handleWindowClose: function (window) {
    console.log('TabHistoryPopover', 'handleWindowClose', arguments);
    this.stopListeningToTabs(window.tabs);
  },
  handleTabClose: function (tab) {
    console.log('TabHistoryPopover', 'handleTabClose', arguments);
    var closedTabs = this.state.closedTabs.slice(); // copy
    closedTabs.push(tab);
    console.log('TabHistoryPopover', 'state.length', closedTabs.length);
    this.setState({
      closedTabs: closedTabs
    });
  },
  stopListeningToTabs: function (tabs) {
    console.log('TabHistoryPopover', 'stopListeningToTabs', arguments);
    tabs.off('tab:close', this.handleWindowClose);
  },
  render: function () {
    console.log('TabHistoryPopover', 'render', this.state);
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
    return <li key={ closedTab.uuid }>
      <span className="title">
        { closedTab.browserTab.title }
      </span>
      <span>{ closedTab.expired }</span>
    </li>;
  }
});

module.exports = TabHistoryPopover;