'use strict';
var uuid = 0;

module.exports = getUUID;

function getUUID () {
  return uuid++;
}