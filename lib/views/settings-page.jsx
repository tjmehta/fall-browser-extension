/** @jsx React.DOM */
'use strict';
require('config');
var React = require('react');
var settings = require('models/settings');

var SettingsPage = module.exports = React.createClass({
  getInitialState: function () {
    return {
      expirationTime: settings.get(process.env.TAB_EXPIRATION_KEY),
      maxTabs: settings.get(process.env.MAX_TABS)
    };
  },
  render: function () {
    return <div data-page="settings" className="page cached">
      <div className="page-content hide-bars-on-scroll pad-top-24">
        <div className="list-block">
          <ul>
            <li>
              <div className="item-content">
                <div className="item-inner">
                  <div className="item-title label">Slider</div>
                  <div className="item-input">
                    <div className="range-slider">
                      <input type="range" min="0" max="100" value="50" step="0.1" />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>;
  }
});

SettingsPage.navBar = <div data-page="settings" className="navbar-inner cached">
  <div className="left sliding">
    <a href="#" className="link back">
      <i className="icon icon-back"></i>
      <span className="">Tabs</span>
    </a>
  </div>
  <div className="center">Settings</div>
  <div className="right"></div>
</div>;