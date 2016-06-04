'use strict';

var handlers = require('../handler');

module.exports.handler = function(event, context) {
  handlers.handler(__dirname, context, {
    title: 'What does AWS Lambda\'s Node.js environment support?',
    version: 'v4.3.2'
  });
};
