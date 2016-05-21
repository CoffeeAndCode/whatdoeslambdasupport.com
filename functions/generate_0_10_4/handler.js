'use strict';

var path = require('path');
var fs = require('fs');
var handlers = require('../handler');

var template = fs.readFileSync(path.join(__dirname, 'templates/index.html.hbs'), 'utf8');

module.exports.handler = function(event, context) {
  handlers.handler(template, context);
};
