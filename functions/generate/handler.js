'use strict';

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
    error = catchError(function() {
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

  return context.done(null, {
    message: 'Go Serverless! Your Lambda function executed successfully!'
  });
};
