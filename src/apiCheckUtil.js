

module.exports = {each, copy, typeOf, getErrorMessage, getCheckerDisplay};

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

function getErrorMessage(api, args) {
  api = arrayify(api);
  args = arrayify(args);
  var apiTypes = api.map(checker => {
    return getCheckerDisplay(checker) + (checker.isOptional ? ' (optional)' : '');
  }).join(', ');
  var passedTypes = args.length ? args.map(typeOf).join(', ') : 'nothing';
  return 'apiCheck failed! You passed: `' + passedTypes + '` and should have passed: `' + apiTypes + '`';
}

function getCheckerDisplay(checker) {
  return checker.type || checker.displayName || checker.name;
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
