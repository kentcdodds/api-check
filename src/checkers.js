const {
  typeOf, each, copy, getCheckerDisplay, isError,
  arrayify, list, getError, nAtL, t, checkerHelpers
  } = require('./apiCheckUtil');

let checkers = module.exports = {
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
  typeOrArrayOf: typeOrArrayOfCheckGetter,

  shape: getShapeCheckGetter(),
  args: argumentsCheckerGetter(),

  any: anyCheckGetter()
};

each(checkers, checkerHelpers.setupChecker);


function getTypeOfChecker(type) {
  const lType = type.toLowerCase();
  return checkerHelpers.wrapInSpecified(function typeOfCheckerDefinition(val, name, location) {
    if (typeOf(val) !== lType) {
      return getError(name, location, type);
    }
  }, type);
}

function getObjectChecker() {
  const type = 'Object';
  const nullType = 'Object (null ok)';
  let objectNullOkChecker = checkerHelpers.wrapInSpecified(function objectNullOkCheckerDefinition(val, name, location) {
    if (typeOf(val) !== 'object') {
      return getError(name, location, nullType);
    }
  }, nullType);

  let objectChecker = checkerHelpers.wrapInSpecified(function objectCheckerDefinition(val, name, location) {
    if (val === null || isError(objectNullOkChecker(val, name, location))) {
      return getError(name, location, objectChecker.type);
    }
  }, type);

  objectChecker.nullOk = objectNullOkChecker;
  objectChecker.childrenCheckers = ['nullOk'];

  return objectChecker;
}


function instanceCheckGetter(classToCheck) {
  return checkerHelpers.wrapInSpecified(function instanceCheckerDefinition(val, name, location) {
    if (!(val instanceof classToCheck)) {
      return getError(name, location, classToCheck.name);
    }
  }, classToCheck.name);
}

function oneOfCheckGetter(enums) {
  const type = {
    __apiCheckData: {optional: false, type: 'enum'},
    enum: enums
  };
  const shortType = `enum[${enums.map(enm => JSON.stringify(enm)).join(', ')}]`;
  return checkerHelpers.wrapInSpecified(function oneOfCheckerDefinition(val, name, location) {
    if (!enums.some(enm => enm === val)) {
      return getError(name, location, shortType);
    }
  }, type, shortType);
}

function oneOfTypeCheckGetter(checkers) {
  const type = {
    __apiCheckData: {optional: false, type: 'oneOfType'},
    oneOfType: checkers.map((checker) => getCheckerDisplay(checker))
  };
  const shortType = `oneOfType[${checkers.map((checker) => getCheckerDisplay(checker, true)).join(', ')}]`;
  return checkerHelpers.wrapInSpecified(function oneOfTypeCheckerDefinition(val, name, location) {
    if (!checkers.some(checker => !isError(checker(val, name, location)))) {
      return getError(name, location, shortType);
    }
  }, type, shortType);
}

function arrayOfCheckGetter(checker) {
  const type = {
    __apiCheckData: {optional: false, type: 'arrayOf'},
    arrayOf: getCheckerDisplay(checker)
  };
  const shortType = `arrayOf[${getCheckerDisplay(checker)}]`;
  return checkerHelpers.wrapInSpecified(function arrayOfCheckerDefinition(val, name, location) {
    if (isError(checkers.array(val)) || !val.every((item) => !isError(checker(item)))) {
      return getError(name, location, shortType);
    }
  }, type, shortType);
}

function objectOfCheckGetter(checker) {
  const type = {
    __apiCheckData: {optional: false, type: 'objectOf'},
    objectOf: getCheckerDisplay(checker)
  };
  const shortType = `objectOf[${getCheckerDisplay(checker)}]`;
  return checkerHelpers.wrapInSpecified(function objectOfCheckerDefinition(val, name, location) {
    const isObject = checkers.object(val, name, location);
    if (isError(isObject)) {
      return isObject;
    }
    const allTypesSuccess = each(val, (item, key) => {
      if (isError(checker(item, key, name))) {
        return false;
      }
    });
    if (!allTypesSuccess) {
      return getError(name, location, shortType);
    }
  }, type, shortType);
}

function typeOrArrayOfCheckGetter(checker) {
  const type = {
    __apiCheckData: {optional: false, type: 'typeOrArrayOf'},
    typeOrArrayOf: getCheckerDisplay(checker)
  };
  const shortType = `typeOrArrayOf[${getCheckerDisplay(checker)}]`;
  return checkerHelpers.wrapInSpecified(function typeOrArrayOfDefinition(val, name, location, obj) {
    if (isError(checkers.oneOfType([checker, checkers.arrayOf(checker)])(val, name, location, obj))) {
      return getError(name, location, shortType);
    }
  }, type, shortType);
}

function getShapeCheckGetter() {
  function shapeCheckGetter(shape) {
    let shapeTypes = {};
    each(shape, (val, prop) => {
      shapeTypes[prop] = getCheckerDisplay(val);
    });
    const type = {
      __apiCheckData: {strict: false, optional: false, type: 'shape'},
      shape: shapeTypes
    };
    let shapeChecker = checkerHelpers.wrapInSpecified(function shapeCheckerDefinition(val, name, location) {
      let isObject = checkers.object(val, name, location);
      if (isError(isObject)) {
        return isObject;
      }
      let shapePropError;
      each(shape, (checker, prop) => {
        if (val.hasOwnProperty(prop) || !checker.isOptional) {
          shapePropError = checker(val[prop], prop, name, val);
          return !isError(shapePropError);
        }
      });
      if (isError(shapePropError)) {
        return shapePropError;
      }
    }, type, 'shape');

    let strictType = copy(shapeChecker.type);
    strictType.__apiCheckData = copy(shapeChecker.type.__apiCheckData);
    strictType.__apiCheckData.strict = true;
    shapeChecker.strict = checkerHelpers.wrapInSpecified(function strictShapeCheckerDefinition(val, name, location) {
      const shapeError = shapeChecker(val, name, location);
      if (isError(shapeError)) {
        return shapeError;
      }
      const allowedProperties = Object.keys(shape);
      const extraProps = Object.keys(val).filter(prop => allowedProperties.indexOf(prop) === -1);
      if (extraProps.length) {
        return new Error(
          `${nAtL(name, location)} cannot have extra properties: ${t(extraProps.join('`, `'))}.` +
          `It is limited to ${t(allowedProperties.join('`, `'))}`
        );
      }
    }, strictType, 'strict shape');
    shapeChecker.childrenCheckers = ['strict'];
    checkerHelpers.setupChecker(shapeChecker);

    return shapeChecker;
  }

  shapeCheckGetter.ifNot = function ifNot(otherProps, propChecker) {
    if (!Array.isArray(otherProps)) {
      otherProps = [otherProps];
    }
    let type;
    if (otherProps.length === 1) {
      type = `specified only if ${otherProps[0]} is not specified`;
    } else {
      type = `specified only if none of the following are specified: [${list(otherProps, ', ', 'and ')}]`;
    }
    let ifNotChecker = function ifNotCheckerDefinition(prop, propName, location, obj) {
      let propExists = obj && obj.hasOwnProperty(propName);
      let otherPropsExist = otherProps.some(otherProp => obj && obj.hasOwnProperty(otherProp));
      if (propExists === otherPropsExist) {
        return getError(propName, location, ifNotChecker.type);
      } else if (propExists) {
        return propChecker(prop, propName, location, obj);
      }
    };

    ifNotChecker.type = type;
    ifNotChecker.shortType = `ifNot[${otherProps.join(', ')}]`;
    checkerHelpers.setupChecker(ifNotChecker);
    return ifNotChecker;
  };

  shapeCheckGetter.onlyIf = function onlyIf(otherProps, propChecker) {
    otherProps = arrayify(otherProps);
    let type;
    if (otherProps.length === 1) {
      type = `specified only if ${otherProps[0]} is also specified`;
    } else {
      type = `specified only if all of the following are specified: [${list(otherProps, ', ', 'and ')}]`;
    }
    let onlyIfChecker = function onlyIfCheckerDefinition(prop, propName, location, obj) {
      const othersPresent = otherProps.every(prop => obj.hasOwnProperty(prop));
      if (!othersPresent) {
        return getError(propName, location, onlyIfChecker.type);
      } else {
        return propChecker(prop, propName, location, obj);
      }
    };

    onlyIfChecker.type = type;
    onlyIfChecker.shortType = `onlyIf[${otherProps.join(', ')}]`;
    checkerHelpers.setupChecker(onlyIfChecker);
    return onlyIfChecker;
  };

  return shapeCheckGetter;
}

function argumentsCheckerGetter() {
  const type = 'function arguments';
  return checkerHelpers.wrapInSpecified(function argsCheckerDefinition(val, name, location) {
    if (Array.isArray(val) || isError(checkers.object(val)) || isError(checkers.number(val.length))) {
      return getError(name, location, type);
    }
  }, type);
}

function anyCheckGetter() {
  return checkerHelpers.wrapInSpecified(function anyCheckerDefinition() {
    // don't do anything
  }, 'any');
}
