'use strict';

process.env.TAB_EXPIRATION_KEY = 'tabExpirationTime';
process.env.MAX_TABS = 'maxTabsInHistory';
process.env.MIN_TABS_PER_WINDOW = 'minOpenTabsPerWindow';
process.env.ENABLED = 'enabled';
process.env.LOG = 'false';

console._log = console.log;

console.log = function () {
  if (process.env.LOG === 'true') {
    console._log.apply(console, arguments);
  }
};

module.exports = process.env;