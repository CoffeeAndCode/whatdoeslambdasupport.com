'use strict';

var handlers = require('../handler');

module.exports.handler = function(event, context) {
  handlers.handler(__dirname, context, {
    title: 'What does AWS Lambda\'s v0.10.4 Node.js environment support?',
    version: 'v0.10.4'
  });
};
