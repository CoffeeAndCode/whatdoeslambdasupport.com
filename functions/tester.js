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

  if (wrappedTest) {
    kangaxTest.calledFunction = wrappedTest;
    kangaxTest.result = getResult(wrappedTest);
  }

  if (kangaxTest.hasOwnProperty('subtests')) {
    kangaxTest.subtests = kangaxTest.subtests.map(module.exports);
  }

  if (typeof kangaxTest.result === 'undefined' && kangaxTest.subtests) {
    var summaryResult = true;
    for (var i = 0; i < kangaxTest.subtests.length; i++) {
      if (!kangaxTest.subtests[i].result) {
        summaryResult = false;
      }
    }
    kangaxTest.result = summaryResult;
  }

  return kangaxTest;
}
