'use strict';

function catchError(method) {
  var result;

  try {
    result = method();
  } catch (error) {
    result = error;
  }

  return result;
}

function getResult(methodAsString) {
  var result = catchError(function() {
    return eval(methodAsString);
  });

  return result instanceof Error ? false : result;
}

function wrapTestFunction(test) {
  if (typeof test === 'function') {
    // test is wrapped in multiline comments
    if (test.toString().match(/[^]*\/\*([^]*)\*\/\}$/)) {
      return '(function (){' + test.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1] + '})()';
    } else {
      return '(' + test.toString() + ')()';
    }
  }
}

module.exports = function(kangaxTest) {
  var wrappedTest = wrapTestFunction(kangaxTest.exec);

  kangaxTest.result = true;
  if (wrappedTest) {
    kangaxTest.calledFunction = wrappedTest;
    kangaxTest.result = getResult(wrappedTest);
  }

  if (kangaxTest.hasOwnProperty('subtests')) {
    kangaxTest.subtests = kangaxTest.subtests.map(module.exports);
  }

  return kangaxTest;
}
