'use strict';
var EventTarget = require('mocks/event-target');
var keypather = require('keypather')();
require('config');

keypather.set(global, 'safari.extension.settings', new EventTarget());
safari.extension.settings[process.env.TAB_EXPIRATION_KEY] = 1000*1000;