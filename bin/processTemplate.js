#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

require('dotenv').config();

const ENVType = new yaml.Type('!env', {
  construct: function(env) {
    return process.env[env];
  },
  kind: 'scalar'
});

try {
  const template = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../template.yml'), 'utf8'), {
    schema: yaml.Schema.create([ ENVType ])
  });
  fs.writeFileSync(path.join(__dirname, '../template.processed.yml'), yaml.safeDump(template));
} catch (error) {
  console.log(`An error occurred: ${error}`);
}
