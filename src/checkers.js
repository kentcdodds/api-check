const {
  typeOf, each, copy, getCheckerDisplay, isError,
  arrayify, list, getError, nAtL, t, checkerHelpers,
  undef
  } = require('./apiCheckUtil');

let checkers = module.exports = {
  array: getTypeOfChecker('Array'),
  bool: getTypeOfChecker('Boolean'),
  number: getTypeOfChecker('Number'),
  string: getTypeOfChecker('String'),
  func: getFunctionChecker(),
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

function getFunctionChecker() {
  const type = 'Function';
  let functionChecker = checkerHelpers.wrapInSpecified(function functionCheckerDefinition(val, name, location) {
    if (typeOf(val) !== 'function') {
      return getError(name, location, type);
    }
  }, type);

  functionChecker.withProperties = function getWithPropertiesChecker(properties) {
    const apiError = checkers.objectOf(checkers.func)(properties, 'properties', 'apiCheck.func.withProperties');
    if (isError(apiError)) {
      throw apiError;
    }
    let shapeChecker = checkers.shape(properties, true);
    shapeChecker.type.__apiCheckData.type = 'func.withProperties';

    return checkerHelpers.wrapInSpecified(function functionWithPropertiesChecker(val, name, location) {
      const notFunction = checkers.func(val, name, location);
      if (isError(notFunction)) {
        return notFunction;
      }
      return shapeChecker(val, name, location);
    }, shapeChecker.type, 'func.withProperties');
  };

  functionChecker.childrenCheckers = ['withProperties'];
  return functionChecker;
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
  const checkersDisplay = checkers.map((checker) => getCheckerDisplay(checker, {short: true}));
  const shortType = `oneOfType[${checkersDisplay.join(', ')}]`;
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
  const checkerDisplay = getCheckerDisplay(checker, {short: true});
  const shortType = `arrayOf[${checkerDisplay}]`;
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
  const checkerDisplay = getCheckerDisplay(checker, {short: true});
  const shortType = `objectOf[${checkerDisplay}]`;
  return checkerHelpers.wrapInSpecified(function objectOfCheckerDefinition(val, name, location) {
    const notObject = checkers.object(val, name, location);
    if (isError(notObject)) {
      return notObject;
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
  const checkerDisplay = getCheckerDisplay(checker, {short: true});
  const shortType = `typeOrArrayOf[${checkerDisplay}]`;
  return checkerHelpers.wrapInSpecified(function typeOrArrayOfDefinition(val, name, location, obj) {
    if (isError(checkers.oneOfType([checker, checkers.arrayOf(checker)])(val, name, location, obj))) {
      return getError(name, location, shortType);
    }
  }, type, shortType);
}

function getShapeCheckGetter() {
  function shapeCheckGetter(shape, nonObject) {
    let shapeTypes = {};
    each(shape, (checker, prop) => {
      shapeTypes[prop] = getCheckerDisplay(checker);
    });
    function type(options = {}) {
      let ret = {};
      const {terse, obj, addHelpers} = options;
      const parentRequired = options.required;
      each(shape, (checker, prop) => {
        /* jshint maxcomplexity:6 */
        const specified = obj && obj.hasOwnProperty(prop);
        const required = undef(parentRequired) ? !checker.isOptional : parentRequired;
        if (!terse || (specified || !checker.isOptional)) {
          ret[prop] = getCheckerDisplay(checker, {terse, obj: obj && obj[prop], required, addHelpers});
        }
        if (addHelpers) {
          modifyTypeDisplayToHelpOut(ret, prop, specified, checker, required);
        }
      });
      return ret;

      function modifyTypeDisplayToHelpOut(ret, prop, specified, checker, required) {
        if (!specified && required && !checker.isOptional) {
          let item = 'ITEM';
          if (checker.type && checker.type.__apiCheckData) {
            item = checker.type.__apiCheckData.type.toUpperCase();
          }
          addHelper(
            'missing', 'MISSING THIS ' + item, ' <-- YOU ARE MISSING THIS'
          );
        } else if (specified) {
          let error = checker(obj[prop], prop, null, obj);
          if (isError(error)) {
            addHelper('error', 'THIS IS THE PROBLEM: ' + error.message, ' <-- THIS IS THE PROBLEM: ' + error.message);
          }
        }

        function addHelper(property, objectMessage, stringMessage) {
          if (typeof ret[prop] === 'string') {
            ret[prop] += stringMessage;
          } else {
            ret[prop].__apiCheckData[property] = objectMessage;
          }
        }
      }
    }

    type.__apiCheckData = {strict: false, optional: false, type: 'shape'};
    let shapeChecker = checkerHelpers.wrapInSpecified(function shapeCheckerDefinition(val, name, location) {
      /* jshint maxcomplexity:6 */
      let isObject = !nonObject && checkers.object(val, name, location);
      if (isError(isObject)) {
        return isObject;
      }
      let shapePropError;
      location = location ? location + (name ? '/' : '') : '';
      name = name || '';
      each(shape, (checker, prop) => {
        if (val.hasOwnProperty(prop) || !checker.isOptional) {
          shapePropError = checker(val[prop], prop, `${location}${name}`, val);
          return !isError(shapePropError);
        }
      });
      if (isError(shapePropError)) {
        return shapePropError;
      }
    }, type, 'shape');

    function strictType() {
      return type(...arguments);
    }

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

