const apiCheckUtil = require('./apiCheckUtil');
const {each, isError, t, arrayify, getCheckerDisplay, typeOf, getError} = apiCheckUtil;
const checkers = require('./checkers');
const apiCheckApiCheck = getApiCheckInstance({
  output: {prefix: 'apiCheck'}
});
const checkerFnChecker = checkers.func.withProperties({
  type: checkers.oneOfType([checkers.string, checkerTypeType]).optional,
  displayName: checkers.string.optional,
  shortType: checkers.string.optional,
  notOptional: checkers.bool.optional,
  childrenCheckers: checkers.arrayOf(checkers.string).optional
});

const getApiCheckInstanceCheckers = [
  checkers.shape({
    output: checkers.shape({
      prefix: checkers.string.optional
    })
  }),
  checkers.objectOf(checkerFnChecker).optional
];

module.exports = getApiCheckInstance;
module.exports.internalChecker = apiCheckApiCheck;
module.exports.utils = apiCheckUtil;

each(checkers, (checker, name) => module.exports[name] = checker);

function getApiCheckInstance(config = {}, extraCheckers = {}) {
  if (apiCheckApiCheck && arguments.length) {
    apiCheckApiCheck.throw(getApiCheckInstanceCheckers, arguments, {
      prefix: 'creating an instance of apiCheck'
    });
  }

  let disabled = false;
  let additionalProperties = {
    throw: getApiCheck(true),
    warn: getApiCheck(false),
    disable: () => disabled = true,
    enable: () => disabled = false,
    getErrorMessage,
    handleErrorMessage,
    config: {
      output: config.output || {
        prefix: '',
        suffix: '',
        docsBaseUrl: ''
      },
      verbose: config.verbose || false
    },
    utils: apiCheckUtil
  };

  each(additionalProperties, (wrapper, name) => apiCheck[name] = wrapper);
  each(checkers, (checker, name) => apiCheck[name] = checker);
  each(extraCheckers, (checker, name) => apiCheck[name] = checker);

  return apiCheck;


  /**
   * This is the instance function. Other things are attached to this see additional properties above.
   * @param api {Array}
   * @param args {arguments}
   * @param output {Object}
   * @returns {Object} - if this has a failed = true property, then it failed
   */
  function apiCheck(api, args, output) {
    /* jshint maxcomplexity:8 */
    if (disabled) {
      return {
        apiTypes: {}, argTypes: {},
        passed: true, message: '',
        failed: false
      }; // empty version of what is normally returned
    }
    checkApiCheckApi(arguments);
    const arrayArgs = Array.prototype.slice.call(args);
    let messages;
    api = arrayify(api);
    let enoughArgs = checkEnoughArgs(api, arrayArgs);
    if (enoughArgs.length) {
      messages = enoughArgs;
    } else {
      messages = checkApiWithArgs(api, arrayArgs);
    }
    let returnObject = getTypes(api, arrayArgs);
    if (messages.length) {
      returnObject.message = apiCheck.getErrorMessage(api, arrayArgs, messages, output);
      returnObject.failed = true;
      returnObject.passed = false;
    } else {
      returnObject.message = '';
      returnObject.passed = true;
      returnObject.failed = false;
    }
    return returnObject;
  }

  function checkApiCheckApi(args) {
    const os = checkers.string.optional;
    const api = [ // dog fooding here
      checkers.typeOrArrayOf(checkerFnChecker),
      checkers.oneOfType([
        checkers.args, checkers.array
      ]),
      checkers.shape({
        prefix: os, suffix: os, urlSuffix: os, // appended case
        onlyPrefix: os, onlySuffix: os, url: os // override case
      }).strict.optional
    ];
    let errors = checkEnoughArgs(api, args);
    if (!errors.length) {
      errors = checkApiWithArgs(api, args);
    }
    let message;
    if (errors.length) {
      message = apiCheck.getErrorMessage(api, args, errors, {
        prefix: 'apiCheck'
      });
      apiCheck.handleErrorMessage(message, true);
    }
  }


  function getApiCheck(shouldThrow) {
    return function apiCheckWrapper(api, args, output) {
      let result = apiCheck(api, args, output);
      apiCheck.handleErrorMessage(result.message, shouldThrow);
      return result; // wont get here if an error is thrown
    };
  }

  function handleErrorMessage(message, shouldThrow) {
    if (shouldThrow && message) {
      throw new Error(message);
    } else if (message) {
      console.warn(message);
    }
  }

  function getErrorMessage(api, args, messages = [], output = {}) {
    let gOut = apiCheck.config.output || {};
    let prefix = getPrefix();
    let suffix = getSuffix();
    let url = getUrl();
    let message = `apiCheck failed! ${messages.join(', ')}`;
    var passedAndShouldHavePassed = '\n\n' + buildMessageFromApiAndArgs(api, args);
    return `${prefix} ${message} ${suffix} ${url || ''}${passedAndShouldHavePassed}`.trim();

    function getPrefix() {
      let prefix = output.onlyPrefix;
      if (!prefix) {
        prefix = `${gOut.prefix || ''} ${output.prefix || ''}`.trim();
      }
      return prefix;
    }

    function getSuffix() {
      let suffix = output.onlySuffix;
      if (!suffix) {
        suffix = `${output.suffix || ''} ${gOut.suffix || ''}`.trim();
      }
      return suffix;
    }

    function getUrl() {
      let url = output.url;
      if (!url) {
        url = gOut.docsBaseUrl && output.urlSuffix && `${gOut.docsBaseUrl}${output.urlSuffix}`.trim();
      }
      return url;
    }
  }

  function buildMessageFromApiAndArgs(api, args) {
    api = arrayify(api);
    args = arrayify(args);
    let {apiTypes, argTypes} = getTypes(api, args);
    let copy = args.slice();
    let replacedItems = [];
    replaceFunctionWithName(copy);
    const passedArgs = copy.length ? JSON.stringify(copy, null, 2) : 'nothing';
    argTypes = args.length ? JSON.stringify(argTypes, null, 2) : 'nothing';
    apiTypes = apiTypes.length ? JSON.stringify(apiTypes, null, 2) : 'nothing';
    const n = '\n';
    return [
      `You passed:${n}${passedArgs}`,
      `With the types of:${n}${argTypes}`,
      `The API calls for:${n}${apiTypes}`
    ].join(n + n);

    function replaceFunctionWithName(obj) {
      each(obj, (val, name) => {
        /* jshint maxcomplexity:6 */
        if (replacedItems.indexOf(val) === -1) { // avoid recursive problems
          replacedItems.push(val);
          if (typeof val === 'object') {
            replaceFunctionWithName(obj);
          } else if (typeof val === 'function') {
            obj[name] = val.displayName || val.name || 'anonymous function';
          }
        }
      });
    }
  }

  function getTypes(api, args) {
    api = arrayify(api);
    args = arrayify(args);
    let apiTypes = api.map((checker, index) => {
      return getCheckerDisplay(checker, {terse: !apiCheck.config.verbose, obj: args[index], addHelpers: true});
    });
    let argTypes = args.map(getArgDisplay);
    return {argTypes: argTypes, apiTypes};
  }

}


// STATELESS FUNCTIONS

/**
 * This is where the magic happens for actually checking the arguments with the api.
 * @param api {Array} - checkers
 * @param args {Array} - and arguments object
 * @returns {Array}
 */
function checkApiWithArgs(api, args) {
  /* jshint maxcomplexity:7 */
  let messages = [];
  let failed = false;
  let checkerIndex = 0;
  let argIndex = 0;
  let arg, checker, res, lastChecker, argName, argFailed, skipPreviousChecker;
  /* jshint -W084 */
  while ((checker = api[checkerIndex++]) && (argIndex < args.length)) {
    arg = args[argIndex++];
    argName = 'Argument ' + argIndex + (checker.isOptional ? ' (optional)' : '');
    res = checker(arg, null, argName);
    argFailed = isError(res);
    lastChecker = checkerIndex >= api.length;
    skipPreviousChecker = checkerIndex > 1 && api[checkerIndex - 1].isOptional;
    if ((argFailed && lastChecker) || (argFailed && !lastChecker && !checker.isOptional && !skipPreviousChecker)) {
      failed = true;
      messages.push(getCheckerErrorMessage(res, checker, arg));
    } else if (argFailed && checker.isOptional) {
      argIndex--;
    } else {
      messages.push(`${t(argName)} passed`);
    }
  }
  return failed ? messages : [];
}


checkerTypeType.type = 'function with __apiCheckData property and `${function.type}` property';
function checkerTypeType(checkerType, name, location) {
  const apiCheckDataChecker = checkers.shape({
    type: checkers.string,
    optional: checkers.bool
  });
  const asFunc = checkers.func.withProperties({__apiCheckData: apiCheckDataChecker});
  const asShape = checkers.shape({__apiCheckData: apiCheckDataChecker});
  const wrongShape = checkers.oneOfType([
    asFunc, asShape
  ])(checkerType, name, location);
  if (isError(wrongShape)) {
    return wrongShape;
  }
  if (typeof checkerType !== 'function' && !checkerType.hasOwnProperty(checkerType.__apiCheckData.type)) {
    return getError(name, location, checkerTypeType.type);
  }
}

function getCheckerErrorMessage(res, checker, val) {
  let checkerHelp = getCheckerHelp(checker, val);
  checkerHelp = checkerHelp ? ' - ' + checkerHelp : '';
  return res.message + checkerHelp;
}

function getCheckerHelp({help}, val) {
  if (!help) {
    return '';
  }
  if (typeof help === 'function') {
    help = help(val);
  }
  return help;
}


function checkEnoughArgs(api, args) {
  let requiredArgs = api.filter(a => !a.isOptional);
  if (args.length < requiredArgs.length) {
    return [
      'Not enough arguments specified. Requires `' + requiredArgs.length + '`, you passed `' + args.length + '`'
    ];
  } else {
    return [];
  }
}

var eachable = {
  Object: getDisplay,
  Array: getDisplay
};

function getDisplay(obj) {
  var argDisplay = {};
  each(obj, (v, k) => argDisplay[k] = getArgDisplay(v));
  return argDisplay;
}

function getArgDisplay(arg) {
  var cName = arg && arg.constructor && arg.constructor.name;
  return cName ? eachable[cName] ? eachable[cName](arg) : cName : arg === null ? 'null' : typeOf(arg);
}
