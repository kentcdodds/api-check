var {typeOf, each, copy, getCheckerDisplay} = require('./apiCheckUtil');
var checkers = module.exports = {
  array: getTypeOfChecker('Array'),
  bool: getTypeOfChecker('Boolean'),
  func: getTypeOfChecker('Function'),
  number: getTypeOfChecker('Number'),
  string: getTypeOfChecker('String'),
  object: getObjectChecker(),

  instanceOf: instanceCheckGetter,
  oneOf: oneOfCheckGetter,
  oneOfType: oneOfTypeCheckGetter,

  arrayOf: arrayOfCheckGetter,
  objectOf: objectOfCheckGetter,

  shape: getShapeCheckGetter(),

  any: anyCheckGetter()
};

each(checkers, checker => {
  checker.displayName = `apiCheck \`${checker.type}\` type checker`;
});


function getTypeOfChecker(type) {
  var lType = type.toLowerCase();
  function typeOfChecker(val) {
    return typeOf(val) === lType;
  }

  typeOfChecker.type = type;
  makeOptional(typeOfChecker);
  return typeOfChecker;
}

function getObjectChecker() {
  function objectNullOkChecker(val) {
    return typeOf(val) === 'object';
  }
  objectNullOkChecker.type = 'Object[null ok]';
  makeOptional(objectNullOkChecker);
  function objectChecker(val) {
    return val !== null && objectNullOkChecker(val);
  }
  objectChecker.type = 'Object';
  makeOptional(objectChecker);
  objectChecker.nullOk = objectNullOkChecker;

  return objectChecker;
}


function instanceCheckGetter(classToCheck) {
  function instanceChecker(val) {
    return val instanceof classToCheck;
  }

  instanceChecker.type = classToCheck.name;
  makeOptional(instanceChecker);
  return instanceChecker;
}

function oneOfCheckGetter(items) {
  function oneOfChecker(val) {
    return items.some(item => item === val);
  }

  oneOfChecker.type = `enum[${items.join(', ')}]`;
  makeOptional(oneOfChecker);
  return oneOfChecker;
}

function oneOfTypeCheckGetter(checkers) {
  function oneOfTypeChecker(val) {
    return checkers.some(item => item(val));
  }

  oneOfTypeChecker.type = checkers.map(getCheckerDisplay).join(' or ');
  makeOptional(oneOfTypeChecker);
  return oneOfTypeChecker;
}

function arrayOfCheckGetter(checker) {
  function arrayOfChecker(val) {
    return checkers.array(val) && val.every(checker);
  }

  arrayOfChecker.type = `arrayOf[${getCheckerDisplay(checker)}]`;
  makeOptional(arrayOfChecker);
  return arrayOfChecker;
}

function objectOfCheckGetter(checker) {
  function objectOfChecker(val) {
    return checkers.object(val) && each(val, checker);
  }

  objectOfChecker.type = `objectOf[${getCheckerDisplay(checker)}]`;
  makeOptional(objectOfChecker);
  return objectOfChecker;
}

function getShapeCheckGetter() {
  function shapeCheckGetter(shape) {
    function shapeChecker(val) {
      return checkers.object(val) && each(shape, (checker, prop) => {
          if (!val.hasOwnProperty(prop) && checker.isOptional) {
            return true;
          } else {
            return checker(val[prop], prop, val);
          }
        }) && (!shapeChecker.strict || each(val, (prop, name) => {
          return shape.hasOwnProperty(name);
        }));
    }

    var copiedShape = copy(shape);
    each(copiedShape, (val, prop) => {
      copiedShape[prop] = getCheckerDisplay(val);
    });
    shapeChecker.type = `shape(${JSON.stringify(copiedShape)})`;
    makeOptional(shapeChecker);
    return shapeChecker;
  }

  shapeCheckGetter.ifNot = function ifNot(otherProps, propChecker) {
    if (!Array.isArray(otherProps)) {
      otherProps = [otherProps];
    }
    function ifNotChecker(prop, propName, obj) {
      var propExists = !obj.hasOwnProperty(propName);
      return propExists || (!otherProps.some(otherProp => obj.hasOwnProperty(otherProp)) && propChecker(prop));
    }
    ifNotChecker.type = `ifNot[${otherProps.join(', ')}]`;
    makeOptional(ifNotChecker);
    return ifNotChecker;
  };

  shapeCheckGetter.onlyIf = function onlyIf(otherProps, propChecker) {
    if (!Array.isArray(otherProps)) {
      otherProps = [otherProps];
    }
    function onlyIfChecker(prop, propName, obj) {
      return otherProps.every(prop => obj.hasOwnProperty(prop)) && propChecker(prop);
    }
    onlyIfChecker.type = `onlyIf[${otherProps.join(', ')}]`;
    makeOptional(onlyIfChecker);
    return onlyIfChecker;
  };

  return shapeCheckGetter;
}

function anyCheckGetter() {
  function anyChecker() {
    return true;
  }

  anyChecker.type = 'any';
  makeOptional(anyChecker);
  return anyChecker;
}

function makeOptional(checker) {
  checker.optional = function optionalCheck() {
    return checker(...arguments);
  };
  checker.optional.isOptional = true;
  checker.optional.type = checker.type;
  checker.optional.displayName = checker.displayName;
}
