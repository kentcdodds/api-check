var {each, getErrorMessage} = require('./apiCheckUtil');
var checkers = require('./checkers');
var disabled = false;

module.exports = apiCheck;

var additionalFns = {
  throw: getApiCheck(true),
  warn: getApiCheck(false),
  disable: () => disabled = true,
  enable: () => disabled = false
};

each(additionalFns, (wrapper, name) => module.exports[name] = wrapper);
each(checkers, (checker, name) => module.exports[name] = checker);



function apiCheck(api, args) {
  var results = [];
  if (!args) {
    throw new Error('apiCheck failed: Must pass arguments to check');
  }
  args = [...args];
  if (disabled) {
    results = args.map(() => true);
  } else if (checkers.array(api) && args) {
    results = checkMultiArgApi(api, args);
  } else if (checkers.func(api)) {
    results.push(api(args[0]));
  } else {
    throw new Error('apiCheck failed: Must pass an array or a function');
  }
  return results;
}

function checkMultiArgApi(api, args) {
  var results = [];
  var checkerIndex = 0;
  var argIndex = 0;
  var arg, checker, res;
  /* jshint -W084 */
  while(arg = args[argIndex++]) {
    checker = api[checkerIndex++];
    res = checker(arg);
    if (!res && !checker.isOptional) {
      results.push(false);
    } else if (!res) {
      argIndex--;
    } else {
      results.push(true);
    }
  }
  return results;
}


function getApiCheck(shouldThrow) {
  return function apiCheckWrapper(api, args) {
    var result = apiCheck(...arguments);
    args = [...args];
    var failed = result.some(passed => !passed);

    if (shouldThrow && failed) {
      throw new Error(getErrorMessage(api, args));
    } else if (failed) {
      console.warn(getErrorMessage(api, args));
    }
  };
}
