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
    return {
      settings: settings.all()
    };
  },
  handleSettingChange: function () {
    console.log('SettingsPage', 'handleSettingChange', arguments);
    this.setState({
      settings: settings.all()
    });
  },
  handleSliderChange: function (evt) {
    console.log('SettingsPage', 'handleSliderChange', arguments);
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
    this.setState({
      settings: all
    });
  },
  handleBoolChange: function (evt) {
    console.log('SettingsPage', 'handleBoolChange', arguments);

  },
  render: function () {
    console.log('SettingsPage', 'render', arguments);
    var self = this;
    var state = this.state || [];
    return <div data-page="settings" className="page cached">
      <div className="page-content hide-bars-on-scroll pad-top-24">
        <div className="list-block">
          <ul>
          {
            state.settings.map(function (vals) {
              return <li key={ vals.key }>
                <div className="item-content">
                  <div className="item-inner">
                    <div className="item-title label">{ capitalize.words(toSpaceCase(vals.key)) }</div>
                    <div className="item-input">
                    {
                      vals.type === 'slider' ?
                        self.sliderInput(vals) :
                        self.boolInput(vals)
                    }
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
  },
  sliderInput: function (vals) {
    console.log('SettingsPage', 'sliderInput', arguments);
    var self = this;
    return <div className="range-slider">
      <input
        name={ vals.key }
        type="range"
        min={ vals.min }
        max={ vals.max }
        value={ vals.tempVal || vals.val }
        onChange={ self.handleSliderChange }
        step="1" />
      <div className="center-text">
      {
        (vals.units === 'minutes') ?
          formatDuration(vals.tempVal || vals.val, vals.units) :
          (vals.tempVal || vals.val) + ' ' + vals.units
      }
      </div>
    </div>;
  },
  boolInput: function (vals) {
    console.log('SettingsPage', 'boolInput', arguments);
    var self = this;
    return <label className="label-switch">
      {
        vals.val ?
          <input name={ vals.key } type="checkbox" checked onChange={ self.handleBoolChange } /> :
          <input name={ vals.key } type="checkbox" onChange={ self.handleBoolChange } />
      }
      <div className="checkbox"></div>
    </label>;
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