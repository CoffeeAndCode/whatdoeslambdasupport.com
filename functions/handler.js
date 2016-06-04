'use strict';

var aws = require('aws-sdk');
var handlebars = require('handlebars');
var path = require('path');
var readFileSync = require('fs').readFileSync;
var es5Tests = require('./tests/data-es5');
var es6Tests = require('./tests/data-es6');
var esnextTests = require('./tests/data-esnext');
var esintlTests = require('./tests/data-esintl');
var tester = require('./tester');

function addSummaryResults(kangaxTest) {
  if (typeof kangaxTest.result === 'undefined' && kangaxTest.subtests) {
    var summaryResult = true;
    for (var i = 0; i < kangaxTest.subtests.length; i++) {
      if (!kangaxTest.subtests[i].result) {
        summaryResult = false;
      }
    }
    kangaxTest.result = summaryResult;
  }
}

module.exports.handler = function(functionPath, context, templateData) {
  handlebars.registerHelper('ifEqual', function(conditional, comparator, options) {
    if (conditional === comparator) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  var source = readFileSync(path.join(__dirname, 'templates', 'index.html.hbs'));
  var template = handlebars.compile(source.toString());
  var data = {
    buildTime: new Date(),
    es5: es5Tests.tests.map(tester),
    es6: es6Tests.tests.map(tester),
    esnext: esnextTests.tests.map(tester),
    esintl: esintlTests.tests.map(tester),
    meta: templateData,
    testImportTime: require('./tests/timestamp')
  };

  // Wait for async tests to complete for arbitrary amount of time.
  setTimeout(function() {
    data.es5.map(addSummaryResults);
    data.es6.map(addSummaryResults);
    data.esnext.map(addSummaryResults);
    data.esintl.map(addSummaryResults);

    var html = template(data);
    var s3 = new aws.S3();

    s3.putObject({
      ACL: 'public-read',
      Body: html,
      Bucket: process.env['S3_WEBSITE_BUCKET'],
      ContentType: 'text/html',
      Key: 'index.html'
    }, function(error, data) {
      if (error) { context.fail(error); }

      return context.succeed(data);
    });
  }, 1000);
};
