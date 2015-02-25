const checkerHelpers = {
  makeOptional, wrapInSpecified, setupChecker
};

module.exports = {
  each, copy, typeOf, arrayify, getCheckerDisplay, isError, list, getError, nAtL, t, undef, checkerHelpers
};

function copy(obj) {
  var daCopy = Array.isArray(obj) ? [] : {};
  each(obj, (val, key) => daCopy[key] = val);
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

function getCheckerDisplay(checker) {
  return (checker.type || checker.displayName || checker.name) + (checker.isOptional ? ' (optional)' : '');
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
  return new Error(`${nAtL(name, location)} must be ${t(checkerType)}`);
}

function nAtL(name, location) {
  const tName = t(name || 'value');
  let tLocation = undef(location) ? '' : ' at ' + t(location);
  return `${tName}${tLocation}`;
}

function t(thing) {
  return '`' + thing + '`';
}

function undef(thing) {
  return typeof thing === 'undefined';
}




function makeOptional(checker) {
  checker.optional = function optionalCheck(val, name, location, obj) {
    if (!undef(val)) {
      return checker(val, name, location, obj);
    }
  };
  checker.optional.isOptional = true;
  checker.optional.type = checker.type;
  checker.optional.displayName = checker.displayName;
}

function wrapInSpecified(fn, type) {
  fn.type = type;
  function specifiedChecker(val, name, location, obj) {
    const u = undef(val);
    if (u && !fn.isOptional) {
      let tLocation = location ? ` in ${t(location)}` : '';
      return new Error(`Required ${t(name)} not specified${tLocation}. Must be ${t(fn.type)}`);
    } else {
      return fn(val, name, location, obj);
    }
  }
  specifiedChecker.type = type;
  specifiedChecker.notOptional = fn.notOptional;
  specifiedChecker.childrenCheckers = fn.childrenCheckers;
  setupChecker(specifiedChecker);
  setupChecker(fn);
  return specifiedChecker;
}

function setupChecker(checker) {
  checker.displayName = `apiCheck ${t(checker.type || checker.name)} type checker`;
  if (!checker.notOptional) {
    makeOptional(checker);
  }
  each(checker.childrenCheckers, childName => {
    setupChecker(checker[childName]);
  });
}
