'use strict';

var aws = require('aws-sdk');
var handlebars = require('handlebars');
var path = require('path');
var readFileSync = require('fs').readFileSync;
var es5Tests = require('compat-table/data-es6');
var tester = require('./tester');

module.exports.handler = function(functionPath, context) {
  var testResults = es5Tests.tests.map(tester);

  var source = readFileSync(path.join(functionPath, 'templates', 'index.html.hbs'));
  var template = handlebars.compile(source.toString());
  var html = template({
    buildTime: new Date(),
    tests: testResults
  });

  var s3 = new aws.S3();
  s3.putObject({
    ACL: 'public-read',
    Body: html,
    Bucket: process.env['S3_WEBSITE_BUCKET'],
    ContentType: 'text/html',
    Key: 'index.html'
  }, function(error, data) {
    if (error) console.log(error.message); // an error occurred
    else     console.log(data);           // successful response

    return context.done(null, {
      message: 'Go Serverless! Your Lambda function executed successfully!'
    });
  });
};
