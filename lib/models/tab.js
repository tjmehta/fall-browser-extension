'use strict';
var Model = require('models/model');
var settings = require('models/settings');
var exists = require('101/exists');
var pluck = require('101/pluck');
var equals = require('101/equals');
var pluck = require('101/pluck');
var last = require('101/last');
var url = require('url');
var xhr = require('utils/xhr');
var asyncSome = require('async-some');
require('config');


function Tab (browserTab) {
  console.log(this.constructor.name, 'Tab', arguments);
  Model.call(this);
  this.time = {
    opened: Date.now()
  };
  this.browserTab = browserTab;
  this.url = this.browserTab.url; // initial url
  this.listen();
  if (!this.isActive()) {
    this.handleExpirationTimeChange();
  }
}

require('util').inherits(Tab, Model);

// get method for future browser compatibility purposes
Tab.prototype.get = function (key) {
  console.log(this.constructor.name, 'get', arguments);
  return this.browserTab[key];
};

Tab.prototype.favicon = function () {
  console.log('favicon', 'faviconUrl', this.faviconUrl);
  if (this.faviconUrl) { return this.faviconUrl; }
  var parsed = url.parse(this.url);
  parsed.path = parsed.pathname = '/favicon.ico';
  this.faviconUrl = url.format(parsed);
  this.fetchBetterFavicon();

  return this.faviconUrl;
};

Tab.prototype.fetchBetterFavicon = function () {
  console.log('fetchBetterFavicon');
  var self = this;
  xhr.get(this.url, 'document', function (err, res) {
    console.log('xhr.get(this.url, document)', arguments);
    if (err) { return console.log(err); }
    var xml = res.responseXML;
    if (xml) {
      var icons = [].concat(
        xml.querySelector('meta[property="og:image"]'),
        last(xml.querySelectorAll('link[rel="apple-touch-icon"]')), // last tends to be largest..
        xml.querySelector('meta[itemprop="image"]'),
        xml.querySelector('link[rel="icon"]'),
        xml.querySelector('link[rel="shortcut icon"]')  // worst
      );
      var iconUrls = icons
        .map(pluckUrl)
        .filter(exists)
        .map(fullUrl);
      iconUrls.push(self.faviconUrl); // as backup
      asyncSome(iconUrls, imageExists, updateFavicon);
    }
  });
  function pluckUrl (node) {
    return node && (node.content || node.href);
  }
  function fullUrl (iconUrl) {
    var parsedIconUrl = url.parse(iconUrl);
    if (parsedIconUrl.hostname || parsedIconUrl.host) {
      return iconUrl; // already full
    }
    var parsedPageUrl = url.parse(self.url);
    parsedPageUrl.path =
      parsedPageUrl.pathname =
      (parsedIconUrl.path || parsedIconUrl.pathname);

    return url.format(parsedPageUrl);
  }
  function imageExists (iconUrl, cb) {
    xhr.head(iconUrl, function (err, res) {
      console.log('xhr.head(iconUrl)', iconUrl, arguments);
      if (err) { return cb(null, false); } // ignore err;
      console.log(iconUrl, 'responded', res.status);
      if (res.status >= 400) {
        return cb(null, false);
      }
      cb(null, iconUrl); // found good url
    });
  }
  function updateFavicon (err, faviconUrl) {
    // ignoring errs above..
    if (self.faviconUrl !== faviconUrl) {
      self.faviconUrl = faviconUrl;
      self.emit('change', self, { key: 'favicon', value: self.faviconUrl });
    }
  }
};

Tab.prototype.isActive = function () {
  console.log(this.constructor.name, 'isActive', arguments);
  return this.browserTab === this.browserTab.browserWindow.activeTab;
};

Tab.prototype.listen = function () {
  console.log(this.constructor.name, 'listen', arguments);
  this.browserTab.addEventListener('activate', this.stopTimeout);
  this.browserTab.addEventListener('deactivate', this.resetTimeout);
  this.browserTab.addEventListener('close', this.handleClose);
  settings.addEventListener('change', this.handleSettingChange);
};

Tab.prototype.handleSettingChange = function (evt) {
  console.log(this.constructor.name, 'handleSettingChange', arguments);
  if (evt.key === process.env.TAB_EXPIRATION_KEY &&
      this.expirationTime !== evt.newValue) {
    this.handleExpirationTimeChange(evt.newValue);
  }
};

Tab.prototype.handleExpirationTimeChange = function () {
  console.log(this.constructor.name, 'handleExpirationTimeChange', arguments);
  if (this.isActive()) { return; }
  this.resetTimeout();
};

Tab.prototype.handleClose = function () {
  console.log(this.constructor.name, 'handleClose', arguments);
  this.url = this.browserTab.url;
  this.title = this.browserTab.title;
  this.browserWindow = this.browserTab.browserWindow;
  this.emit('close', this); // this must happen before destroy
  this.destroy();
};

Tab.prototype.resetTimeout = function () {
  console.log(this.constructor.name, 'resetTimeout', arguments);
  this.stopTimeout();
  var expirationTime = settings.get(process.env.TAB_EXPIRATION_KEY);
  console.log(this.constructor.name, 'resetTimeout', 'expirationTime', expirationTime);
  if (exists(expirationTime)) { // could be 0s
    this.timeout = setTimeout(
      this.expire,
      expirationTime * 60 * 1000);
  }
};

Tab.prototype.stopTimeout = function () {
  console.log(this.constructor.name, 'stopTimeout', arguments);
  if (this.timeout) {
    clearTimeout(this.timeout);
    delete this.timeout;
  }
};

Tab.prototype.expire = function () {
  console.log(this.constructor.name, 'expire', arguments);
  this.expired = true; // must happen before close
  this.close();
  // FIXME: optimization
  // json encode tab vs keeping a ref to actual browser tab
  this.emit('expire', this);
};

Tab.prototype.close = function () {
  console.log(this.constructor.name, 'close', arguments);
  this.browserTab.close();
};

Tab.prototype.restore = function () {
  console.log(this.constructor.name, 'restore', arguments);
  var openWindows = require('models/open-windows');
  var browserWindowStillOpen = openWindows
    .map(pluck('browserWindow'))
    .find(equals(this.browserWindow));
  console.log(this.constructor.name, 'restore', openWindows, this.browserWindow);
  var newTab = browserWindowStillOpen ?
    this.browserWindow.openTab() :
    openWindows.openNewWindow().tabs[0];
  newTab.url = this.url;
  this.browserTab = null;
  this.browserWindow = null;
};

Tab.prototype.destroy = function () {
  console.log(this.constructor.name, 'destroy', arguments);
  if (this.destroyed) { return; }
  this.destroyed = true;
  this.stopListening();
  this.stopTimeout();
  this.emit('destroy', this);
};

Tab.prototype.stopListening = function () {
  console.log(this.constructor.name, 'stopListening', arguments);
  this.browserTab.removeEventListener('activate', this.stopTimeout);
  this.browserTab.removeEventListener('deactivate', this.resetTimeout);
  this.browserTab.removeEventListener('close', this.handleClose);
  settings.removeEventListener('change', this.handleSettingChange);
};

module.exports = Tab;