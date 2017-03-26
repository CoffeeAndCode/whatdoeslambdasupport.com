module.exports.invokeFunction = function(lambda, lambdaARN) {
  return new Promise(function(resolve, reject) {
    lambda.invoke({
      FunctionName: lambdaARN,
      InvocationType: 'Event'
    }, function(error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(Object.assign({}, data, {
          arn: lambdaARN
        }));
      }
    });
  });
}
