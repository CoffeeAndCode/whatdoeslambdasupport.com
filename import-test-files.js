'use strict';

var fs = require('fs');
var path = require('path');
var request = require('request');

var testFileBaseURL = 'https://raw.githubusercontent.com/kangax/compat-table/gh-pages/';

function getTestFile(fileName) {
  request(testFileBaseURL + fileName).pipe(fs.createWriteStream(path.join('functions/tests', fileName)));
}

getTestFile('data-es5.js');
getTestFile('data-es6.js');
getTestFile('data-esintl.js');
getTestFile('data-esnext.js');
getTestFile('esnext-browsers.js');
fs.writeFile(path.join('functions/tests', 'timestamp.js'), 'module.exports = "' + new Date() + '";');
