'use strict';

var aws = require('aws-sdk');
var fs = require('fs');
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

module.exports.handler = function(event, context, callback) {
  const done = (error, response) => callback(null, {
    body: error ? error.message : JSON.stringify(response),
    headers: {
      'Content-Type': 'application/json',
    },
    statusCode: error ? '500' : '200'
  });

  handlebars.registerHelper('ifEqual', function(conditional, comparator, options) {
    if (conditional === comparator) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  handlebars.registerHelper('anchorify', function (str) {
    return str.replace(/\s+/g, '-').replace(/[^a-z0-9_-]/gi, '');
  });
  handlebars.registerPartial('menu', readFileSync(path.join(__dirname, 'templates', '_menu.html.hbs')).toString());
  handlebars.registerPartial('test-result', readFileSync(path.join(__dirname, 'templates', '_test-result.html.hbs')).toString());

  var source = readFileSync(path.join(__dirname, 'templates', 'index.html.hbs'));
  var template = handlebars.compile(source.toString());
  var data = {
    buildTime: new Date(),
    es5: es5Tests.tests.map(tester),
    es6: es6Tests.tests.map(tester),
    esnext: esnextTests.tests.map(tester),
    esintl: esintlTests.tests.map(tester),
    meta: {
      nodeVersions: ['v6.10.0', 'v4.3.2'],
      title: `What does AWS Lambda\'s Node.js ${process.version} environment support?`,
      version: process.version,
    },
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
    var filesSaved = 0;

    if (process.env.OUTPUT_TO_FOLDER) {
      var outputFolder = path.join(__dirname, '../..', process.env.OUTPUT_TO_FOLDER);
      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
      }
      fs.writeFileSync(path.join(__dirname, '../..', process.env.OUTPUT_TO_FOLDER, 'index.html'), html);
    } else {
      if (process.env.IS_DEFAULT_RUNTIME === 'TRUE') {
        s3.putObject({
          ACL: 'public-read',
          Body: html,
          Bucket: process.env.S3_WEBSITE_BUCKET,
          ContentType: 'text/html',
          Key: 'index.html'
        }, function(error) {
          if (error) { done(error); return; }

          filesSaved++;
          if (filesSaved === 2) {
            done(null, { success: true });
          }
        });
      }

      s3.putObject({
        ACL: 'public-read',
        Body: html,
        Bucket: process.env.S3_WEBSITE_BUCKET,
        ContentType: 'text/html',
        Key: `${process.version}/index.html`
      }, function(error) {
        if (error) { done(error); return; }

        filesSaved++;
        if (filesSaved === 2) {
          done(null, { success: true });
        }
      });
    }

    var errorPage = readFileSync(path.join(__dirname, 'templates', '404.html.hbs'));
    if (process.env.OUTPUT_TO_FOLDER) {
      fs.writeFileSync(path.join(__dirname, '../..', process.env.OUTPUT_TO_FOLDER, '404.html'), handlebars.compile(errorPage.toString())(data));

      fs.writeFileSync(path.join(__dirname, '../..', process.env.OUTPUT_TO_FOLDER, 'style.css'), readFileSync(path.join(__dirname, 'assets', 'style.css')).toString());
      done(null, { success: true });
    } else {
      if (process.env.IS_DEFAULT_RUNTIME === 'TRUE') {
        s3.putObject({
          ACL: 'public-read',
          Body: handlebars.compile(errorPage.toString())(data),
          Bucket: process.env.S3_WEBSITE_BUCKET,
          ContentType: 'text/html',
          Key: '404.html'
        }, function(error) {
          if (error) { done(error); return; }

          filesSaved++;
          if (filesSaved === 2) {
            done(null, { success: true });
          }
        });

        s3.putObject({
          ACL: 'public-read',
          Body: readFileSync(path.join(__dirname, 'assets', 'style.css')).toString(),
          Bucket: process.env.S3_WEBSITE_BUCKET,
          ContentType: 'text/css',
          Key: 'style.css'
        }, function(error) {
          if (error) { done(error); return; }

          filesSaved++;
          if (filesSaved === 2) {
            return done(null, { success: true });
          }
        });
      }

      s3.putObject({
        ACL: 'public-read',
        Body: handlebars.compile(errorPage.toString())(data),
        Bucket: process.env.S3_WEBSITE_BUCKET,
        ContentType: 'text/html',
        Key: `${process.version}/404.html`
      }, function(error) {
        if (error) { done(error); return; }

        filesSaved++;
        if (filesSaved === 2) {
          done(null, { success: true });
        }
      });

      s3.putObject({
        ACL: 'public-read',
        Body: readFileSync(path.join(__dirname, 'assets', 'style.css')).toString(),
        Bucket: process.env.S3_WEBSITE_BUCKET,
        ContentType: 'text/css',
        Key: `${process.version}/style.css`
      }, function(error) {
        if (error) { done(error); return; }

        filesSaved++;
        if (filesSaved === 2) {
          return done(null, { success: true });
        }
      });
    }
  }, 1000);
};
