'use strict';

var xhr = module.exports = {};

xhr.get = function (url, type, cb) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    cb(null, this);
  };
  xhr.onerror = cb;
  xhr.open('GET', url);
  xhr.responseType = type;
  xhr.send();
};

xhr.head = function (url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    cb(null, this);
  };
  xhr.onerror = cb;
  xhr.open('HEAD', url);
  xhr.send();
};