const https = require('https');
const url = require('url');

const sendResponse = function(event, context, callback, responseStatus, responseData) {
  var responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: `See the details in CloudWatch Log Stream: ${context.logStreamName}`,
    PhysicalResourceId: context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData
  });

  console.log(`RESPONSE BODY:\n${responseBody}`);

  var parsedUrl = url.parse(event.ResponseURL);
  var options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'PUT',
    headers: {
      'content-length': responseBody.length,
      'content-type': ''
    }
  };

  console.log('SENDING RESPONSE...');

  var request = https.request(options, function(response) {
    console.log(`STATUS: ${response.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
    callback(null);
  });

  request.on('error', function(error) {
    console.error(`sendResponse Error: ${error}`);
    callback(error);
  });

  // write data to request body
  request.write(responseBody);
  request.end();
}

module.exports.failure = (event, context, callback, error) => (
  sendResponse(event, context, callback, 'FAILURE', {
    Error: error.message
  })
);

module.exports.success = (event, context, callback, responseData) => (
  sendResponse(event, context, callback, 'SUCCESS', responseData)
);
