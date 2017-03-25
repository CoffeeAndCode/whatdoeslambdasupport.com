#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');

const testFileBaseURL = 'https://raw.githubusercontent.com/kangax/compat-table/gh-pages/';

function getTestFile(fileName) {
  request(testFileBaseURL + fileName).pipe(fs.createWriteStream(path.join(__dirname, '../app/tests', fileName)));
}

getTestFile('data-common.json');
getTestFile('data-es2016plus.js');
getTestFile('data-es5.js');
getTestFile('data-es6.js');
getTestFile('data-esintl.js');
getTestFile('data-esnext.js');
getTestFile('data-non-standard.js');
fs.writeFileSync(path.join(__dirname, '../app/tests/timestamp.js'), 'module.exports = "' + new Date() + '";');
