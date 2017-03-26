#!/usr/bin/env node
'use strict';

const spawn = require('child_process').spawn;

require('dotenv').config();

const commandParts = `aws cloudformation deploy --parameter-overrides WebsiteBucketName=${process.env.S3_WEBSITE_BUCKET} --template-file template.deployed.yml --stack-name wdls --capabilities CAPABILITY_IAM`.split(/\s+/);

const deploy = spawn(commandParts[0], commandParts.slice(1), {
  stdio: 'inherit'
});

deploy.on('exit', (code) => {
  if (code !== 0) {
    process.exit(code);
  }
});
