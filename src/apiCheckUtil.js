const checkerHelpers = {
  addOptional, getRequiredVersion, setupChecker
};

module.exports = {
  each, copy, typeOf, arrayify, getCheckerDisplay,
  isError, list, getError, nAtL, t, undef, checkerHelpers,
  noop
};

function copy(obj) {
  let type = typeOf(obj);
  let daCopy;
  if (type === 'array') {
    daCopy = [];
  } else if (type === 'object') {
    daCopy = {};
  } else {
    return obj;
  }
  each(obj, (val, key) => {
    daCopy[key] = val; // cannot single-line this because we don't want to abort the each
  });
  return daCopy;
}


function typeOf(obj) {
  if (Array.isArray(obj)) {
    return 'array';
  } else if (obj instanceof RegExp) {
    return 'object';
  } else {
    return typeof obj;
  }
}

function getCheckerDisplay(checker, options) {
  /* jshint maxcomplexity:7 */
  let display;
  let short = options && options.short;
  if (short && checker.shortType) {
    display = checker.shortType;
  } else if (!short && typeof checker.type === 'object' || checker.type === 'function') {
    display = getCheckerType(checker, options);
  } else {
    display = getCheckerType(checker, options) || checker.displayName || checker.name;
  }
  return display;
}

function getCheckerType({type}, options) {
  if (typeof type === 'function') {
    let __apiCheckData = type.__apiCheckData;
    let typeTypes = type(options);
    type = {
      __apiCheckData,
      [__apiCheckData.type]: typeTypes
    };
  }
  return type;
}

function arrayify(obj) {
  if (!obj) {
    return [];
  } else if (Array.isArray(obj)) {
    return obj;
  } else {
    return [obj];
  }
}


function each(obj, iterator, context) {
  if (Array.isArray(obj)) {
    return eachArry(...arguments);
  } else {
    return eachObj(...arguments);
  }
}

function eachObj(obj, iterator, context) {
  var ret;
  var hasOwn = Object.prototype.hasOwnProperty;
  for (var key in obj) {
    if (hasOwn.call(obj, key)) {
      ret = iterator.call(context, obj[key], key, obj);
      if (ret === false) {
        return ret;
      }
    }
  }
  return true;
}

function eachArry(obj, iterator, context) {
  var ret;
  var length = obj.length;
  for (var i = 0; i < length; i++) {
    ret = iterator.call(context, obj[i], i, obj);
    if (ret === false) {
      return ret;
    }
  }
  return true;
}

function isError(obj) {
  return obj instanceof Error;
}

function list(arry, join, finalJoin) {
  arry = arrayify(arry);
  let copy = arry.slice();
  let last = copy.pop();
  if (copy.length === 1) {
    join = ' ';
  }
  return copy.join(join) + `${copy.length ? join + finalJoin : ''}${last}`;
}


function getError(name, location, checkerType) {
  const stringType = typeof checkerType !== 'object' ? checkerType : JSON.stringify(checkerType);
  return new Error(`${nAtL(name, location)} must be ${t(stringType)}`);
}

function nAtL(name, location) {
  const tName = t(name || 'value');
  let tLocation = !location ? '' : ' at ' + t(location);
  return `${tName}${tLocation}`;
}

function t(thing) {
  return '`' + thing + '`';
}

function undef(thing) {
  return typeof thing === 'undefined';
}




function addOptional(checker) {
  function optionalCheck(val, name, location, obj) {
    if (!undef(val)) {
      return checker(val, name, location, obj);
    }
  }
  // inherit all properties on the original checker
  copyProps(checker, optionalCheck);
  each(Object.keys(checker), key => optionalCheck[key] = checker[key]);


  optionalCheck.isOptional = true;
  optionalCheck.displayName = checker.displayName + ' (optional)';


  // the magic line that allows you to add .optional to the end of the checkers
  checker.optional = optionalCheck;

  // fix type, because it's not a straight copy...
  // the reason is we need to specify type.__apiCheckData.optional as true for the terse/verbose option.
  // we also want to add "(optional)" to the types with a string
  if (typeof checker.optional.type === 'object') {
    checker.optional.type = copy(checker.optional.type); // make our own copy of this
  } else if (typeof checker.optional.type === 'function') {
    checker.optional.type = function() {
      return checker.type(...arguments);
    };
  } else {
    checker.optional.type += ' (optional)';
    return;
  }
  checker.optional.type.__apiCheckData = copy(checker.type.__apiCheckData) || {}; // and this
  checker.optional.type.__apiCheckData.optional = true;
}

/**
 * This will set up the checker with all of the defaults that most checkers want like required by default and an
 * optional version
 * @param checker
 * @param properties properties to add to the checker
 */
function setupChecker(checker, properties) {
  /* jshint maxcomplexity:7 */
  checker.noop = noop; // do this first, so it can be overwritten.
  if (typeof checker.type === 'string') {
    checker.shortType = checker.type;
  }

  // assign all properties given
  each(properties, (prop, name) => checker[name] = prop);

  if (!checker.displayName) {
    checker.displayName = `apiCheck ${t(checker.shortType || checker.type || checker.name)} type checker`;
  }

  if (!checker.notRequired) {
    checker = getRequiredVersion(checker);
  }

  if (!checker.notOptional) {
    addOptional(checker);
  }
  return checker;
}

function getRequiredVersion(checker) {
  function requiredChecker(val, name, location, obj) {
    if (undef(val) && !checker.isOptional) {
      let tLocation = location ? ` in ${t(location)}` : '';
      const type = getCheckerDisplay(checker, {short: true});
      const stringType = typeof type !== 'object' ? type : JSON.stringify(type);
      return new Error(`Required ${t(name)} not specified${tLocation}. Must be ${t(stringType)}`);
    } else {
      return checker(val, name, location, obj);
    }
  }
  copyProps(checker, requiredChecker);
  return requiredChecker;
}

function copyProps(src, dest) {
  each(Object.keys(src), key => dest[key] = src[key]);
}

function noop() {
}
