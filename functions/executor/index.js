const aws = require('aws-sdk');
const { failure, success } = require('./lib/response');
const { invokeFunction } = require('./lib/lambda');

module.exports.handler = function(event, context, callback) {
  console.log('here');
  console.log(`REQUEST RECEIVED:\n ${JSON.stringify(event)}`);

  // For Delete requests, immediately send a SUCCESS response.
  if (event.RequestType === 'Delete') {
    success(event, context, callback);
    return;
  }

  if (!event.ResourceProperties.Functions) {
    failure(event, context, callback, new Error('There are no functions listed to execute.'));
  } else {
    const lambda = new aws.Lambda({region: event.ResourceProperties.Region});
    const promises = event.ResourceProperties.Functions.map(lambdaARN => (
      invokeFunction(lambda, lambdaARN)
    ));

    Promise.all(promises)
      .then(data => success(event, context, callback, {
        responses: data
      }))
      .catch(error => failure(event, context, callback, error));
  }
};
