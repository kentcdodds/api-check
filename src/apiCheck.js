const apiCheckUtil = require('./apiCheckUtil');
const {each, isError, t, arrayify, getCheckerDisplay, typeOf} = apiCheckUtil;
const checkers = require('./checkers');
let disabled = false;

module.exports = apiCheck;

let additionalProperties = {
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
  },
  utils: apiCheckUtil
};

each(additionalProperties, (wrapper, name) => module.exports[name] = wrapper);
each(checkers, (checker, name) => module.exports[name] = checker);



function apiCheck(api, args, output) {
  /* jshint maxcomplexity:8 */
  if (disabled) {
    return '';
  }
  checkApiCheckApi(arguments);
  args = Array.prototype.slice.call(args);
  let messages;
  api = arrayify(api);
  let enoughArgs = checkEnoughArgs(api, args);
  if (enoughArgs.length) {
    messages = enoughArgs;
  } else {
    messages = checkApiWithArgs(api, args);
  }
  let returnObject = getTypes(api, args);
  if (messages.length) {
    returnObject.message = module.exports.getErrorMessage(api, args, messages, output);
    returnObject.failed = true;
  }
  return returnObject;
}

function checkApiCheckApi(args) {

  const s = checkers.string;
  const api = [ // dog fooding here
    checkers.typeOrArrayOf(checkers.func),
    checkers.args,
    checkers.shape({prefix: s, suffix: s, url: s}).strict.optional
  ];
  let errors = checkEnoughArgs(api, args);
  if (!errors.length) {
    errors = checkApiWithArgs(api, args);
  }
  let message;
  if (errors.length) {
    message = module.exports.getErrorMessage(api, args, errors, {
      prefix: 'apiCheck'
    });
    module.exports.handleErrorMessage(message, true);
  }
}

function checkApiWithArgs(api, args) {
  let messages = [];
  let failed = false;
  let checkerIndex = 0;
  let argIndex = 0;
  let arg, checker, res;
  /* jshint -W084 */
  while(checker = api[checkerIndex++]) {
    arg = args[argIndex++];
    res = checker(arg, null, 'Argument ' + argIndex);
    if (isError(res) && !checker.isOptional) {
      failed = true;
      messages.push(res.message);
    } else if (checker.isOptional) {
      argIndex--;
    } else {
      messages.push(`${t('Argument ' + argIndex)} passed`);
    }
  }
  if (failed) {
    return messages;
  } else {
    return [];
  }
}

function checkEnoughArgs(api, args) {
  let requiredArgs = api.filter(a => !a.isOptional);
  if (args.length < requiredArgs.length) {
    return ['Not enough arguments specified. Requires `' + requiredArgs.length + '`, you passed `' + args.length + '`'];
  } else {
    return [];
  }
}


function getApiCheck(shouldThrow) {
  return function apiCheckWrapper(api, args, output) {
    let result = apiCheck(api, args, output);
    module.exports.handleErrorMessage(result.message, shouldThrow);
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
  /* jshint maxcomplexity:7 */
  let gOut = module.exports.config.output || {};
  let prefix = `${gOut.prefix || ''} ${output.prefix || ''}`.trim();
  let suffix = `${output.suffix || ''} ${gOut.suffix || ''}`.trim();
  let url = gOut.docsBaseUrl && output.url && `${gOut.docsBaseUrl}${output.url}`.trim();
  let message = `apiCheck failed! ${messages.join(', ')}`;
  var passedAndShouldHavePassed = '\n\n' + buildMessageFromApiAndArgs(api, args);
  return `${prefix} ${message} ${suffix} ${url || ''}${passedAndShouldHavePassed}`.trim();
}


function buildMessageFromApiAndArgs(api, args) {
  api = arrayify(api);
  args = arrayify(args);
  let {apiTypes, argTypes} = getTypes(api, args);
  const passedArgs = args.length ? JSON.stringify(args, null, 2) : 'nothing';
  argTypes = args.length ? JSON.stringify(argTypes, null, 2) : 'nothing';
  apiTypes = apiTypes.length ? JSON.stringify(apiTypes, null, 2) : 'nothing';
  const n = '\n';
  return [
    `You passed:${n}${passedArgs}`,
    `With the types of:${n}${argTypes}`,
    `The API calls for:${n}${apiTypes}`
  ].join(n + n);
}

function getTypes(api, args) {
  api = arrayify(api);
  args = arrayify(args);
  let apiTypes = api.map(checker => {
    return getCheckerDisplay(checker);
  });
  return {argTypes: args.map(getArgDisplay), apiTypes};
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
  return cName ? stringifyable[cName] ? stringifyable[cName](arg) : cName : arg === null ? 'null' : typeOf(arg);
}
