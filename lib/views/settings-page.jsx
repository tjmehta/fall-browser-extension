/** @jsx React.DOM */
'use strict';
require('config');
var React = require('react');
var settings = require('models/settings');
var debounce = require('debounce');
var debouncedSettingsSet = debounce(settings.set.bind(settings), 100);
var toSpaceCase = require('to-space-case');
var capitalize = require('capitalize');
require("moment-duration-format")
var moment = require('moment');
var formatDuration = function (mins, units) {
  return moment.duration(mins, units).format('d [days], h [hours], [and] m [minutes]')
};

var SettingsPage = module.exports = React.createClass({
  getInitialState: function () {
    console.log('SettingsPage', 'getInitialState', arguments);
    settings.addEventListener('change', this.handleSettingChange);
    return settings.all();
  },
  handleSettingChange: function () {
    console.log('SettingsPage', 'handleSettingChange', arguments);
    this.setState(settings.all());
  },
  handleInputChange: function (evt) {
    console.log('SettingsPage', 'handleInputChange', arguments);
    var $input = evt.target;
    var val = parseInt($input.value);
    debouncedSettingsSet($input.name, val);
    var all = settings.all();
    Object.keys(all).some(function (key) {
      if (key === $input.name) {
        var vals = all[key];
        vals.tempVal = val;
        return true; // break some
      }
    });
    this.setState(all);
  },
  render: function () {
    console.log('SettingsPage', 'render', arguments);
    var self = this;
    var state = this.state || {};
    return <div data-page="settings" className="page cached">
      <div className="page-content hide-bars-on-scroll pad-top-24">
        <div className="list-block">
          <ul>
          {
            Object.keys(state).map(function (key) {
              var vals = state[key];
              return <li key={ key }>
                <div className="item-content">
                  <div className="item-inner">
                    <div className="item-title label">{ capitalize.words(toSpaceCase(key)) }</div>
                    <div className="item-input">
                      <div className="range-slider">
                        <input
                          name={ key }
                          type="range"
                          min={ vals.min }
                          max={ vals.max }
                          value={ vals.tempVal || vals.val }
                          onChange={ self.handleInputChange }
                          step="1" />
                        <div className="center-text">
                        {
                          (vals.units === 'minutes') ?
                            formatDuration(vals.tempVal || vals.val, vals.units) :
                            (vals.tempVal || vals.val) + ' tabs'
                        }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>;
            })
          }
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