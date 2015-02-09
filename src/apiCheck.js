var {each, arrayify, getCheckerDisplay, typeOf} = require('./apiCheckUtil');
var checkers = require('./checkers');
var disabled = false;

module.exports = apiCheck;

var additionalProperties = {
  throw: getApiCheck(true),
  warn: getApiCheck(false),
  disable: () => disabled = true,
  enable: () => disabled = false,
  getErrorMessage,
  handleErrorMessage,
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
  if (disabled) {
    return null;
  }
  if (!args) {
    throw new Error('apiCheck failed: Must pass arguments to check');
  }
  args = Array.prototype.slice.call(args);
  if (checkers.array(api)) {
    success = checkEnoughArgs(api, args) && checkMultiArgApi(api, args);
  } else if (checkers.func(api)) {
    success = api(args[0]);
  } else {
    throw new Error('apiCheck failed: Must pass an array or a function');
  }
  return success ? null : module.exports.getErrorMessage(api, args, output);
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

function checkEnoughArgs(api, args) {
  var requiredArgs = api.filter(a => !a.isOptional);
  return args.length >= requiredArgs.length;
}


function getApiCheck(shouldThrow) {
  return function apiCheckWrapper(api, args, output) {
    if (disabled) {
      return null;
    }
    var message = apiCheck(api, args, output);
    module.exports.handleErrorMessage(message, shouldThrow);
  };
}

function handleErrorMessage(message, shouldThrow) {
  if (shouldThrow && message) {
    throw new Error(message);
  } else if (message) {
    console.warn(message);
  }
}

function getErrorMessage(api, args, output = {}) {
  /* jshint maxcomplexity:7 */
  var gOut = module.exports.config.output || {};
  var prefix = `${gOut.prefix || ''} ${output.prefix || ''}`.trim();
  var suffix = `${output.suffix || ''} ${gOut.suffix || ''}`.trim();
  var url = gOut.docsBaseUrl && output.url && `${gOut.docsBaseUrl}${output.url}`.trim();
  return `${prefix} ${buildMessageFromApiAndArgs(api, args)} ${suffix} ${url || ''}`.trim();
}

function buildMessageFromApiAndArgs(api, args) {
  api = arrayify(api);
  args = arrayify(args);
  var apiTypes = api.map(checker => {
    return getCheckerDisplay(checker);
  }).join(', ');
  var passedTypes = args.length ? '`' + args.map(getArgDisplay).join(', ') + '`' : 'nothing';
  return 'apiCheck failed! You passed: ' + passedTypes + ' and should have passed: `' + apiTypes + '`';
}

var stringifyable = {
  Object: getDisplay,
  Array: getDisplay
};

function getDisplay(obj) {
  var argDisplay = {};
  each(obj, (v,k) => argDisplay[k] = getArgDisplay(v));
  return JSON.stringify(obj, (k, v) => argDisplay[k] || v);
}

function getArgDisplay(arg) {
  var cName = arg && arg.constructor && arg.constructor.name;
  return cName ? stringifyable[cName] ? stringifyable[cName](arg) : cName : typeOf(arg);
}
