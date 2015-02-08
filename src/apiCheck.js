var {each, getErrorMessage} = require('./apiCheckUtil');
var checkers = require('./checkers');
var disabled = false;

module.exports = apiCheck;

var additionalProperties = {
  throw: getApiCheck(true),
  warn: getApiCheck(false),
  disable: () => disabled = true,
  enable: () => disabled = false,
  config: {
    output: {
      prefix: '',
      suffix: '',
      docsBaseUrl: ''
    }
  }
};

each(additionalProperties, (wrapper, name) => module.exports[name] = wrapper);
each(checkers, (checker, name) => module.exports[name] = checker);



function apiCheck(api, args, output) {
  /* jshint maxcomplexity:6 */
  var success;
  if (!args) {
    throw new Error('apiCheck failed: Must pass arguments to check');
  }
  args = Array.prototype.slice.call(args);
  if (disabled) {
    success = true;
  } else if (checkers.array(api) && args) {
    success = checkMultiArgApi(api, args);
  } else if (checkers.func(api)) {
    success = api(args[0]);
  } else {
    throw new Error('apiCheck failed: Must pass an array or a function');
  }
  return success ? null : getFailedMessage(api, args, output);
}

function checkMultiArgApi(api, args) {
  var success = true;
  var checkerIndex = 0;
  var argIndex = 0;
  var arg, checker, res;
  /* jshint -W084 */
  while(arg = args[argIndex++]) {
    checker = api[checkerIndex++];
    res = checker(arg);
    if (!res && !checker.isOptional) {
      return false;
    } else if (!res) {
      argIndex--;
    }
  }
  return success;
}


function getApiCheck(shouldThrow) {
  return function apiCheckWrapper(api, args, output) {
    var message = apiCheck(api, args, output);
    args = Array.prototype.slice.call(args);

    if (shouldThrow && message) {
      throw new Error(message);
    } else if (message) {
      console.warn(message);
    }
  };
}

function getFailedMessage(api, args, output = {}) {
  /* jshint maxcomplexity:7 */
  var gOut = module.exports.config.output || {};
  var prefix = `${gOut.prefix || ''} ${output.prefix || ''}`.trim();
  var suffix = `${output.suffix || ''} ${gOut.suffix || ''}`.trim();
  var url = gOut.docsBaseUrl && output.url && `${gOut.docsBaseUrl}${output.url}`.trim();
  return `${prefix} ${getErrorMessage(api, args)} ${suffix} ${url}`.trim();
}
