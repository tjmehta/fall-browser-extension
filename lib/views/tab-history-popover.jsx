/** @jsx React.DOM */
'use strict';
require('config');
var pluck   = require('101/pluck');
var equals  = require('101/equals');
var compose = require('101/compose');
var hasProps = require('101/has-properties');
var React = require('react');
var isExpiredTab = compose(equals(true), pluck('expired'));
var SettingsPage = require('./settings-page.jsx');
var settings = require('models/settings');

var TabHistoryPopover = module.exports = React.createClass({
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
    console.log('TabHistoryPopover', 'handleMaxTabsChange', arguments);
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
    windows.on('window:close', this.handleWindowClose);
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
    var existing = this.closedTabs.remove(hasProps({ url: tab.url }));
    this.closedTabs.unshift(existing || tab);
    console.log('TabHistoryPopover', 'after unshift closedTabs.length', this.closedTabs.length);
    this.setState({
      closedTabs: this.closedTabs.toArray() // copy
    });
  },
  handleClosedTabChange: function () {
    console.log('TabHistoryPopover', 'handleClosedTabChange', arguments);
    this.setState({
      closedTabs: this.closedTabs.toArray() // copy
    });
  },
  handleHiddenInputChange: function (evt) {
    console.log('TabHistoryPopover', 'handleHiddenInputChange', arguments);
    var $hidden = evt.target;
    var $search = document.querySelector('input[type=search]')
    $search.value = $hidden.value;
    $hidden.value = '';
    $search.click();
    $search.focus();

  },
  stopListeningToTabs: function (tabs) {
    console.log('TabHistoryPopover', 'stopListeningToTabs', arguments);
    tabs.off('tab:close', this.handleWindowClose);
  },
  handleSearchKeyDown: function (evt) {
    console.log('TabHistoryPopover', 'handleSearchKeyDown', arguments);
    if (evt.keyCode === 27) {
      this.cancelSearch();
    }
  },
  focusOnHidden: function () {
    console.log('TabHistoryPopover', 'focusOnHidden', arguments);
    var $search = document.querySelector('input[type=search]')
    if ($search === document.activeElement) {
      return;
    }
    var $hidden = document.querySelector('input.offscreen');
    $hidden.click();
    $hidden.focus();
  },
  cancelSearch: function () {
    console.log('TabHistoryPopover', 'cancelSearch', arguments);
    var $cancelSearch = document.querySelector('.searchbar-cancel');
    $cancelSearch.click();
  },
  handleFaviconError: function (tab) {
    console.log('TabHistoryPopover', 'handleFaviconError', arguments);
    tab.setFaviconUrl('');
  },
  render: function () {
    console.log('TabHistoryPopover', 'render', this.state);
    return <div className="views" onClick={ this.focusOnHidden } onKeyDown={ this.focusOnHidden } >
      <div className="view view-main">
        <div className="navbar">
          {/* Home Navbar */}
          <div data-page="home" className="navbar-inner">
            <div className="left"></div>
            <div className="center">Fall: Closed Tabs History</div>
            <div className="right sliding">
              <a href="#settings" className="link">Settings</a>
            </div>
            {/* Search bar */}
            <div className="subnavbar">
              <form
                  data-search-list=".list-block-search"
                  data-search-in=".item-title"
                  className="searchbar searchbar-init">
                <input type="text" className="offscreen" onChange={ this.handleHiddenInputChange } />
                <div className="searchbar-input">
                  <input type="search" placeholder="Search" onKeyDown={ this.handleSearchKeyDown } onBlur={ this.focusOnHidden }/>
                  <a href="#" className="searchbar-clear"></a>
                </div>
                <a href="#" className="searchbar-cancel">Cancel</a>
              </form>
            </div>
          </div>
          {/* Settings Navbar */}
          { SettingsPage.navBar }
        </div>
        <div className="pages navbar-through">
          {/* Home Page */}
          <div data-page="home" className="page with-subnavbar">
            {/* Search bar Overlay */}
            <div className="searchbar-overlay"></div>
            <div className="page-content hide-bars-on-scroll pad-top-64">
              <div className="content-block searchbar-not-found">
                <div className="content-block-inner">Nothing found</div>
              </div>

              <div className="list-block list-block-search media-list active searchbar-found">
                { this.tabList(this.state.closedTabs.slice(0, this.maxTabs), 'No closed or expired tabs') }
              </div>
            </div>
          </div>
          {/* Settings Page */}
          <SettingsPage />
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
        <div className="item-media"><img src={ tab.favicon() } className="thumbnail" onError={ this.handleFaviconError.bind(null, tab) } /></div>
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
    // this.closedTabs.remove(tab); // don't remove restored tab
    tab.restore()
    this.cancelSearch();
  }
});