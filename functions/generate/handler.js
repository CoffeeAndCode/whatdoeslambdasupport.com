'use strict';

var aws = require('aws-sdk');
var path = require('path');
var readFileSync = require('fs').readFileSync;

module.exports.handler = function(event, context) {
  function catchError(method, errorClass, errorMessage) {
    var capturedError;

    try {
      method();
    } catch (error) {
      capturedError = error;
    }

    return capturedError;
  }

  function test(description, testFile) {
    var error = catchError(function() {
      eval(readFileSync(path.join(__dirname, 'tests', testFile)).toString());
    });

    if (error) {
      console.error(description, error);
    }
  }

  test('Check for the const keyword.', 'const.js');
  test('Check for the let keyword.', 'let.js');
  test('Check for the let keyword.', 'letWithoutStrictMode.js');
  test('Check for the Promise constant.', 'Promise.js');
  test('Check for default function arguments.', 'defaultFunctionArguments.js');
  test('Check for template strings.', 'templateStrings.js');

  var s3 = new aws.S3();
  s3.putObject({
    ACL: 'public-read',
    Bucket: process.env['S3_WEBSITE_BUCKET'],
    Key: 'index.html',
    Body: '<h1>hello</h1>',
    ContentType: 'text/html'
  }, function(error, data) {
    if (error) console.log(error.message); // an error occurred
    else     console.log(data);           // successful response

    return context.done(null, {
      message: 'Go Serverless! Your Lambda function executed successfully!'
    });
  });
};
