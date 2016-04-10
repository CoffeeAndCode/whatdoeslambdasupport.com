'use strict';

var handlers = require('../handler');

module.exports.handler = function(event, context) {
  handlers.handler(__dirname, context);
};
