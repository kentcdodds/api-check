var {typeOf, each, copy, getCheckerDisplay} = require('./apiCheckUtil');
var checkers = module.exports = {
  array: getTypeOfChecker('array'),
  bool: getTypeOfChecker('boolean'),
  func: getTypeOfChecker('function'),
  number: getTypeOfChecker('number'),
  object: getTypeOfChecker('object'),
  string: getTypeOfChecker('string'),

  instanceOf: instanceCheckGetter,
  oneOf: oneOfCheckGetter,
  oneOfType: oneOfTypeCheckGetter,

  arrayOf: arrayOfCheckGetter,
  objectOf: objectOfCheckGetter,

  shape: shapeCheckGetter,

  any: anyCheckGetter()
};

each(checkers, checker => {
  checker.displayName = `apiCheck \`${checker.type}\` type checker`;
});


function getTypeOfChecker(type) {
  function typeOfChecker(val) {
    return typeOf(val) === type;
  }

  typeOfChecker.type = type;
  makeOptional(typeOfChecker);
  return typeOfChecker;
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

function shapeCheckGetter(shape) {
  function shapeChecker(val) {
    return checkers.object(val) && each(shape, (checker, prop) => {
        if (!val[prop] && checker.isOptional) {
          return true;
        } else {
          return checker(val[prop]);
        }
      });
  }

  var copiedShape = copy(shape);
  each(copiedShape, (val, prop) => {
    copiedShape[prop] = getCheckerDisplay(val);
  });
  shapeChecker.type = `shape(${JSON.stringify(copiedShape)})`;
  makeOptional(shapeChecker);
  return shapeChecker;
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
