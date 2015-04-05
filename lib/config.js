'use strict';

process.env.TAB_EXPIRATION_KEY = 'tabExpirationTime';
process.env.MAX_TABS = 'maxTabsInHistory';
process.env.MIN_TABS_PER_WINDOW = 'minOpenTabsPerWindow';
process.env.ENABLED = 'enabled';

module.exports = process.env;