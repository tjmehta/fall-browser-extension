/** @jsx React.DOM */
'use strict';
require('config');
var pluck   = require('101/pluck');
var equals  = require('101/equals');
var compose = require('101/compose');
var hasProps = require('101/has-properties');
var React = require('react');
var isExpiredTab = compose(equals(true), pluck('expired'));
var settings = require('models/settings');
require('config');

var TabHistoryPopover = React.createClass({
  getInitialState: function () {
    console.log('TabHistoryPopover', 'getInitialState', arguments);
    this.listenToOpenWindows(this.props.openWindows);
    settings.addEventListener('change', this.handleSettingsChange);
    this.closedTabs = this.props.closedTabs;
    this.listenToClosedTabs(this.closedTabs);
    this.maxTabs = settings.get(process.env.MAX_TABS);
    return {
      closedTabs: this.closedTabs.toArray() // copy
    };
  },
  handleSettingsChange: function (evt) {
    console.log('TabHistoryPopover', 'handleSettingsChange', arguments);
    if (evt.key === process.env.MAX_TABS &&
        this.maxTabs !== evt.newValue) {
      this.handleMaxTabsChange(evt.newValue);
    }
  },
  handleMaxTabsChange: function (maxTabs) {
    this.maxTabs = maxTabs;
    var numToRemove = this.closedTabs.filter(isExpiredTab).length - this.maxTabs;
    if (numToRemove > 0) {
      this.closedTabs.splice(0-numToRemove, numToRemove);
    }
    this.setState({
      closedTabs: this.closedTabs.toArray() // copy
    });
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
  listenToClosedTabs: function (tabs) {
    console.log('TabHistoryPopover', 'listenToClosedTabs', arguments);
    tabs.on('tab:change', this.handleClosedTabChange);
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
    console.log('TabHistoryPopover', 'before unshift closedTabs.length', this.closedTabs.length);
    if (!tab.url) { return; }
    var existing = find(this.closedTabs, hasProps({ url: tab.url }));
    if (existing) {
      this.closedTabs.remove(existing);
      this.closedTabs.unshift(existing);
    }
    else {
      this.closedTabs.unshift(tab);
    }
    console.log('TabHistoryPopover', 'after unshift closedTabs.length', this.closedTabs.length);
    this.setState({
      closedTabs: this.closedTabs.toArray() // copy
    });
  },
  handleClosedTabChange: function () {
    this.setState({
      closedTabs: this.closedTabs.toArray() // copy
    });
  },
  stopListeningToTabs: function (tabs) {
    console.log('TabHistoryPopover', 'stopListeningToTabs', arguments);
    tabs.off('tab:close', this.handleWindowClose);
  },
  render: function () {
    console.log('TabHistoryPopover', 'render', this.state);
    return <div className="views">
      <div className="view view-main">
        <div className="navbar">
          <div className="navbar-inner">
            <div className="left"></div>
            <div className="center">Closed Tabs</div>
            <div className="right"></div>
            <div className="subnavbar">
              <div className="buttons-row">
                <a
                  href="#tab1"
                  className="button tab-link active">All</a>
                <a
                  href="#tab2"
                  className="button tab-link">Expired</a>
              </div>
            </div>
          </div>
        </div>
        <div className="pages navbar-through">
          <div data-page="home" className="page with-subnavbar">
            <div className="page-content hide-bars-on-scroll pad-top-64">
              <div className="tabs">
                <div
                  id="tab1"
                  className="tab list-block media-list active">
                  { this.tabList(this.state.closedTabs.slice(0, this.maxTabs), 'No closed or expired tabs') }
                </div>
                <div
                  id="tab2"
                  className="tab list-block media-list">
                  { this.tabList(this.state.closedTabs.filter(isExpiredTab).slice(0, this.maxTabs), 'No expired tabs') }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  },
  tabList: function (tabs, emptyMessage) {
    return <ul>
      {
        tabs.length ?
          tabs.map(this.tabRow) :
          this.emptyList(emptyMessage)
      }
    </ul>;
  },
  tabRow: function (tab) {
    console.log('TabHistoryPopover', 'tabRow', arguments);
    return <li key={ tab.uuid }>
      <a className="cursor-pointer item-link item-content" onClick={ this.handleItemClick.bind(null, tab) }>
        <div className="item-media"><img src={ tab.favicon() } width="44" /></div>
        <div className="item-inner">
          <div className="item-title-row">
            <div className="item-title">{ tab.title }</div>
            <div className="item-after">{ tab.expired ? 'expired' : '' }</div>
          </div>
          <div className="item-subtitle gray">{ tab.url }</div>
        </div>
      </a>
    </li>;
  },
  emptyList: function (text) {
    console.log('TabHistoryPopover', 'emptyList', arguments);
    return <li key="empty" className="item-content">{ text }</li>;
  },
  handleItemClick: function (tab) {
    console.log('TabHistoryPopover', 'handleItemClick', arguments);
    this.closedTabs.remove(tab);
    this.setState({
      closedTabs: this.closedTabs.toArray() // copy
    });
    tab.restore()
  }
});

module.exports = TabHistoryPopover;