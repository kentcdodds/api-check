// apiCheck.js v1.0.0 built with ♥ by Kent C. Dodds (ó ì_í)=óò=(ì_í ò)

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["apiCheck"] = factory();
	else
		root["apiCheck"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = __webpack_require__(/*! ./apiCheck */ 1);

/***/ },
/* 1 */
/*!*********************!*\
  !*** ./apiCheck.js ***!
  \*********************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _require = __webpack_require__(/*! ./apiCheckUtil */ 2);
	
	var each = _require.each;
	var arrayify = _require.arrayify;
	var getCheckerDisplay = _require.getCheckerDisplay;
	var typeOf = _require.typeOf;
	var checkers = __webpack_require__(/*! ./checkers */ 3);
	var disabled = false;
	
	module.exports = apiCheck;
	
	var additionalProperties = {
	  "throw": getApiCheck(true),
	  warn: getApiCheck(false),
	  disable: function () {
	    return disabled = true;
	  },
	  enable: function () {
	    return disabled = false;
	  },
	  getErrorMessage: getErrorMessage,
	  handleErrorMessage: handleErrorMessage,
	  config: {
	    output: {
	      prefix: "",
	      suffix: "",
	      docsBaseUrl: ""
	    }
	  }
	};
	
	each(additionalProperties, function (wrapper, name) {
	  return module.exports[name] = wrapper;
	});
	each(checkers, function (checker, name) {
	  return module.exports[name] = checker;
	});
	
	
	
	function apiCheck(api, args, output) {
	  /* jshint maxcomplexity:6 */
	  var success;
	  if (disabled) {
	    return null;
	  }
	  if (!args) {
	    throw new Error("apiCheck failed: Must pass arguments to check");
	  }
	  args = Array.prototype.slice.call(args);
	  if (checkers.array(api)) {
	    success = checkEnoughArgs(api, args) && checkMultiArgApi(api, args);
	  } else if (checkers.func(api)) {
	    success = api(args[0]);
	  } else {
	    throw new Error("apiCheck failed: Must pass an array or a function");
	  }
	  return success ? null : module.exports.getErrorMessage(api, args, output);
	}
	
	function checkMultiArgApi(api, args) {
	  var success = true;
	  var checkerIndex = 0;
	  var argIndex = 0;
	  var arg, checker, res;
	  /* jshint -W084 */
	  while (arg = args[argIndex++]) {
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
	  var requiredArgs = api.filter(function (a) {
	    return !a.isOptional;
	  });
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
	
	function getErrorMessage(api, args) {
	  var output = arguments[2] === undefined ? {} : arguments[2];
	  /* jshint maxcomplexity:7 */
	  var gOut = module.exports.config.output || {};
	  var prefix = ("" + (gOut.prefix || "") + " " + (output.prefix || "")).trim();
	  var suffix = ("" + (output.suffix || "") + " " + (gOut.suffix || "")).trim();
	  var url = gOut.docsBaseUrl && output.url && ("" + gOut.docsBaseUrl + "" + output.url).trim();
	  return ("" + prefix + " " + buildMessageFromApiAndArgs(api, args) + " " + suffix + " " + (url || "")).trim();
	}
	
	function buildMessageFromApiAndArgs(api, args) {
	  api = arrayify(api);
	  args = arrayify(args);
	  var apiTypes = api.map(function (checker) {
	    return getCheckerDisplay(checker);
	  }).join(", ");
	  var passedTypes = args.length ? "`" + args.map(getArgDisplay).join(", ") + "`" : "nothing";
	  return "apiCheck failed! You passed: " + passedTypes + " and should have passed: `" + apiTypes + "`";
	}
	
	var stringifyable = {
	  Object: getDisplay,
	  Array: getDisplay
	};
	
	function getDisplay(obj) {
	  var argDisplay = {};
	  each(obj, function (v, k) {
	    return argDisplay[k] = getArgDisplay(v);
	  });
	  return JSON.stringify(obj, function (k, v) {
	    return argDisplay[k] || v;
	  });
	}
	
	function getArgDisplay(arg) {
	  var cName = arg && arg.constructor && arg.constructor.name;
	  return cName ? stringifyable[cName] ? stringifyable[cName](arg) : cName : arg === null ? "null" : typeOf(arg);
	}

/***/ },
/* 2 */
/*!*************************!*\
  !*** ./apiCheckUtil.js ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = { each: each, copy: copy, typeOf: typeOf, arrayify: arrayify, getCheckerDisplay: getCheckerDisplay };
	
	function copy(obj) {
	  var daCopy = Array.isArray(obj) ? [] : {};
	  each(obj, function (val, key) {
	    return daCopy[key] = val;
	  });
	  return daCopy;
	}
	
	
	function typeOf(obj) {
	  if (Array.isArray(obj)) {
	    return "array";
	  } else if (obj instanceof RegExp) {
	    return "object";
	  } else {
	    return typeof obj;
	  }
	}
	
	function getCheckerDisplay(checker) {
	  return (checker.type || checker.displayName || checker.name) + (checker.isOptional ? " (optional)" : "");
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
	    return eachArry.apply(undefined, arguments);
	  } else {
	    return eachObj.apply(undefined, arguments);
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

/***/ },
/* 3 */
/*!*********************!*\
  !*** ./checkers.js ***!
  \*********************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _require = __webpack_require__(/*! ./apiCheckUtil */ 2);
	
	var typeOf = _require.typeOf;
	var each = _require.each;
	var copy = _require.copy;
	var getCheckerDisplay = _require.getCheckerDisplay;
	var checkers = module.exports = {
	  array: getTypeOfChecker("array"),
	  bool: getTypeOfChecker("boolean"),
	  func: getTypeOfChecker("function"),
	  number: getTypeOfChecker("number"),
	  string: getTypeOfChecker("string"),
	  object: getObjectChecker(),
	
	  instanceOf: instanceCheckGetter,
	  oneOf: oneOfCheckGetter,
	  oneOfType: oneOfTypeCheckGetter,
	
	  arrayOf: arrayOfCheckGetter,
	  objectOf: objectOfCheckGetter,
	
	  shape: getShapeCheckGetter(),
	
	  any: anyCheckGetter()
	};
	
	each(checkers, function (checker) {
	  checker.displayName = "apiCheck `" + checker.type + "` type checker";
	});
	
	
	function getTypeOfChecker(type) {
	  function typeOfChecker(val) {
	    return typeOf(val) === type;
	  }
	
	  typeOfChecker.type = type;
	  makeOptional(typeOfChecker);
	  return typeOfChecker;
	}
	
	function getObjectChecker() {
	  function objectNullOkChecker(val) {
	    return typeOf(val) === "object";
	  }
	  objectNullOkChecker.type = "object[null ok]";
	  makeOptional(objectNullOkChecker);
	  function objectChecker(val) {
	    return val !== null && objectNullOkChecker(val);
	  }
	  objectChecker.type = "object";
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
	    return items.some(function (item) {
	      return item === val;
	    });
	  }
	
	  oneOfChecker.type = "enum[" + items.join(", ") + "]";
	  makeOptional(oneOfChecker);
	  return oneOfChecker;
	}
	
	function oneOfTypeCheckGetter(checkers) {
	  function oneOfTypeChecker(val) {
	    return checkers.some(function (item) {
	      return item(val);
	    });
	  }
	
	  oneOfTypeChecker.type = checkers.map(getCheckerDisplay).join(" or ");
	  makeOptional(oneOfTypeChecker);
	  return oneOfTypeChecker;
	}
	
	function arrayOfCheckGetter(checker) {
	  function arrayOfChecker(val) {
	    return checkers.array(val) && val.every(checker);
	  }
	
	  arrayOfChecker.type = "arrayOf[" + getCheckerDisplay(checker) + "]";
	  makeOptional(arrayOfChecker);
	  return arrayOfChecker;
	}
	
	function objectOfCheckGetter(checker) {
	  function objectOfChecker(val) {
	    return checkers.object(val) && each(val, checker);
	  }
	
	  objectOfChecker.type = "objectOf[" + getCheckerDisplay(checker) + "]";
	  makeOptional(objectOfChecker);
	  return objectOfChecker;
	}
	
	function getShapeCheckGetter() {
	  function shapeCheckGetter(shape) {
	    function shapeChecker(val) {
	      return checkers.object(val) && each(shape, function (checker, prop) {
	        if (!val.hasOwnProperty(prop) && checker.isOptional) {
	          return true;
	        } else {
	          return checker(val[prop], prop, val);
	        }
	      }) && (!shapeChecker.strict || each(val, function (prop, name) {
	        return shape.hasOwnProperty(name);
	      }));
	    }
	
	    var copiedShape = copy(shape);
	    each(copiedShape, function (val, prop) {
	      copiedShape[prop] = getCheckerDisplay(val);
	    });
	    shapeChecker.type = "shape(" + JSON.stringify(copiedShape) + ")";
	    makeOptional(shapeChecker);
	    return shapeChecker;
	  }
	
	  shapeCheckGetter.ifNot = function ifNot(otherProps, propChecker) {
	    if (!Array.isArray(otherProps)) {
	      otherProps = [otherProps];
	    }
	    function ifNotChecker(prop, propName, obj) {
	      return !otherProps.some(function (prop) {
	        return obj.hasOwnProperty(prop);
	      }) && propChecker(prop);
	    }
	    ifNotChecker.type = "ifNot[" + otherProps.join(", ") + "]";
	    makeOptional(ifNotChecker);
	    return ifNotChecker;
	  };
	
	  shapeCheckGetter.onlyIf = function onlyIf(otherProps, propChecker) {
	    if (!Array.isArray(otherProps)) {
	      otherProps = [otherProps];
	    }
	    function onlyIfChecker(prop, propName, obj) {
	      return otherProps.every(function (prop) {
	        return obj.hasOwnProperty(prop);
	      }) && propChecker(prop);
	    }
	    onlyIfChecker.type = "onlyIf[" + otherProps.join(", ") + "]";
	    makeOptional(onlyIfChecker);
	    return onlyIfChecker;
	  };
	
	  return shapeCheckGetter;
	}
	
	function anyCheckGetter() {
	  function anyChecker() {
	    return true;
	  }
	
	  anyChecker.type = "any";
	  makeOptional(anyChecker);
	  return anyChecker;
	}
	
	function makeOptional(checker) {
	  checker.optional = function optionalCheck() {
	    return checker.apply(undefined, arguments);
	  };
	  checker.optional.isOptional = true;
	  checker.optional.type = checker.type;
	  checker.optional.displayName = checker.displayName;
	}

/***/ }
/******/ ])
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAxZWIyZTUxNTkwOTU5ODdlMTA0MSIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9hcGlDaGVjay5qcyIsIndlYnBhY2s6Ly8vLi9hcGlDaGVja1V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vY2hlY2tlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7OztBQ3RDQSxPQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFPLENBQUMsbUJBQVksQ0FBQyxDOzs7Ozs7Ozs7OztnQkNBWSxtQkFBTyxDQUFDLHVCQUFnQixDQUFDOztLQUF0RSxJQUFJLFlBQUosSUFBSTtLQUFFLFFBQVEsWUFBUixRQUFRO0tBQUUsaUJBQWlCLFlBQWpCLGlCQUFpQjtLQUFFLE1BQU0sWUFBTixNQUFNO0FBQzlDLEtBQUksUUFBUSxHQUFHLG1CQUFPLENBQUMsbUJBQVksQ0FBQyxDQUFDO0FBQ3JDLEtBQUksUUFBUSxHQUFHLEtBQUssQ0FBQzs7QUFFckIsT0FBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7O0FBRTFCLEtBQUksb0JBQW9CLEdBQUc7QUFDekIsWUFBTyxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQ3hCLE9BQUksRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDO0FBQ3hCLFVBQU8sRUFBRTtZQUFNLFFBQVEs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QyxjQUFJO2dCQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO1FBQUEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztNQUNoRjtBQUNELGtCQUFhLENBQUMsSUFBSSxlQUFhLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQUcsQ0FBQztBQUN4RCxpQkFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzVCLFlBQU8sYUFBYSxDQUFDO0lBQ3RCLENBQUM7O0FBRUYsVUFBTyxnQkFBZ0IsQ0FBQztFQUN6Qjs7QUFFRCxVQUFTLGNBQWMsR0FBRztBQUN4QixZQUFTLFVBQVUsR0FBRztBQUNwQixZQUFPLElBQUksQ0FBQztJQUNiOztBQUVELGFBQVUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLGVBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6QixVQUFPLFVBQVUsQ0FBQztFQUNuQjs7QUFFRCxVQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDN0IsVUFBTyxDQUFDLFFBQVEsR0FBRyxTQUFTLGFBQWEsR0FBRztBQUMxQyxZQUFPLE9BQU8sa0JBQUksU0FBUyxDQUFDLENBQUM7SUFDOUIsQ0FBQztBQUNGLFVBQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUNuQyxVQUFPLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3JDLFVBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImFwaUNoZWNrXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImFwaUNoZWNrXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uXG4gKiovIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgMWViMmU1MTU5MDk1OTg3ZTEwNDFcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vYXBpQ2hlY2snKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vanNoaW50LWxvYWRlciEuL2luZGV4LmpzXG4gKiovIiwidmFyIHtlYWNoLCBhcnJheWlmeSwgZ2V0Q2hlY2tlckRpc3BsYXksIHR5cGVPZn0gPSByZXF1aXJlKCcuL2FwaUNoZWNrVXRpbCcpO1xudmFyIGNoZWNrZXJzID0gcmVxdWlyZSgnLi9jaGVja2VycycpO1xudmFyIGRpc2FibGVkID0gZmFsc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gYXBpQ2hlY2s7XG5cbnZhciBhZGRpdGlvbmFsUHJvcGVydGllcyA9IHtcbiAgdGhyb3c6IGdldEFwaUNoZWNrKHRydWUpLFxuICB3YXJuOiBnZXRBcGlDaGVjayhmYWxzZSksXG4gIGRpc2FibGU6ICgpID0+IGRpc2FibGVkID0gdHJ1ZSxcbiAgZW5hYmxlOiAoKSA9PiBkaXNhYmxlZCA9IGZhbHNlLFxuICBnZXRFcnJvck1lc3NhZ2UsXG4gIGhhbmRsZUVycm9yTWVzc2FnZSxcbiAgY29uZmlnOiB7XG4gICAgb3V0cHV0OiB7XG4gICAgICBwcmVmaXg6ICcnLFxuICAgICAgc3VmZml4OiAnJyxcbiAgICAgIGRvY3NCYXNlVXJsOiAnJ1xuICAgIH1cbiAgfVxufTtcblxuZWFjaChhZGRpdGlvbmFsUHJvcGVydGllcywgKHdyYXBwZXIsIG5hbWUpID0+IG1vZHVsZS5leHBvcnRzW25hbWVdID0gd3JhcHBlcik7XG5lYWNoKGNoZWNrZXJzLCAoY2hlY2tlciwgbmFtZSkgPT4gbW9kdWxlLmV4cG9ydHNbbmFtZV0gPSBjaGVja2VyKTtcblxuXG5cbmZ1bmN0aW9uIGFwaUNoZWNrKGFwaSwgYXJncywgb3V0cHV0KSB7XG4gIC8qIGpzaGludCBtYXhjb21wbGV4aXR5OjYgKi9cbiAgdmFyIHN1Y2Nlc3M7XG4gIGlmIChkaXNhYmxlZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICghYXJncykge1xuICAgIHRocm93IG5ldyBFcnJvcignYXBpQ2hlY2sgZmFpbGVkOiBNdXN0IHBhc3MgYXJndW1lbnRzIHRvIGNoZWNrJyk7XG4gIH1cbiAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpO1xuICBpZiAoY2hlY2tlcnMuYXJyYXkoYXBpKSkge1xuICAgIHN1Y2Nlc3MgPSBjaGVja0Vub3VnaEFyZ3MoYXBpLCBhcmdzKSAmJiBjaGVja011bHRpQXJnQXBpKGFwaSwgYXJncyk7XG4gIH0gZWxzZSBpZiAoY2hlY2tlcnMuZnVuYyhhcGkpKSB7XG4gICAgc3VjY2VzcyA9IGFwaShhcmdzWzBdKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FwaUNoZWNrIGZhaWxlZDogTXVzdCBwYXNzIGFuIGFycmF5IG9yIGEgZnVuY3Rpb24nKTtcbiAgfVxuICByZXR1cm4gc3VjY2VzcyA/IG51bGwgOiBtb2R1bGUuZXhwb3J0cy5nZXRFcnJvck1lc3NhZ2UoYXBpLCBhcmdzLCBvdXRwdXQpO1xufVxuXG5mdW5jdGlvbiBjaGVja011bHRpQXJnQXBpKGFwaSwgYXJncykge1xuICB2YXIgc3VjY2VzcyA9IHRydWU7XG4gIHZhciBjaGVja2VySW5kZXggPSAwO1xuICB2YXIgYXJnSW5kZXggPSAwO1xuICB2YXIgYXJnLCBjaGVja2VyLCByZXM7XG4gIC8qIGpzaGludCAtVzA4NCAqL1xuICB3aGlsZShhcmcgPSBhcmdzW2FyZ0luZGV4KytdKSB7XG4gICAgY2hlY2tlciA9IGFwaVtjaGVja2VySW5kZXgrK107XG4gICAgcmVzID0gY2hlY2tlcihhcmcpO1xuICAgIGlmICghcmVzICYmICFjaGVja2VyLmlzT3B0aW9uYWwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKCFyZXMpIHtcbiAgICAgIGFyZ0luZGV4LS07XG4gICAgfVxuICB9XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5mdW5jdGlvbiBjaGVja0Vub3VnaEFyZ3MoYXBpLCBhcmdzKSB7XG4gIHZhciByZXF1aXJlZEFyZ3MgPSBhcGkuZmlsdGVyKGEgPT4gIWEuaXNPcHRpb25hbCk7XG4gIHJldHVybiBhcmdzLmxlbmd0aCA+PSByZXF1aXJlZEFyZ3MubGVuZ3RoO1xufVxuXG5cbmZ1bmN0aW9uIGdldEFwaUNoZWNrKHNob3VsZFRocm93KSB7XG4gIHJldHVybiBmdW5jdGlvbiBhcGlDaGVja1dyYXBwZXIoYXBpLCBhcmdzLCBvdXRwdXQpIHtcbiAgICBpZiAoZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgbWVzc2FnZSA9IGFwaUNoZWNrKGFwaSwgYXJncywgb3V0cHV0KTtcbiAgICBtb2R1bGUuZXhwb3J0cy5oYW5kbGVFcnJvck1lc3NhZ2UobWVzc2FnZSwgc2hvdWxkVGhyb3cpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVFcnJvck1lc3NhZ2UobWVzc2FnZSwgc2hvdWxkVGhyb3cpIHtcbiAgaWYgKHNob3VsZFRocm93ICYmIG1lc3NhZ2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIH0gZWxzZSBpZiAobWVzc2FnZSkge1xuICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRFcnJvck1lc3NhZ2UoYXBpLCBhcmdzLCBvdXRwdXQgPSB7fSkge1xuICAvKiBqc2hpbnQgbWF4Y29tcGxleGl0eTo3ICovXG4gIHZhciBnT3V0ID0gbW9kdWxlLmV4cG9ydHMuY29uZmlnLm91dHB1dCB8fCB7fTtcbiAgdmFyIHByZWZpeCA9IGAke2dPdXQucHJlZml4IHx8ICcnfSAke291dHB1dC5wcmVmaXggfHwgJyd9YC50cmltKCk7XG4gIHZhciBzdWZmaXggPSBgJHtvdXRwdXQuc3VmZml4IHx8ICcnfSAke2dPdXQuc3VmZml4IHx8ICcnfWAudHJpbSgpO1xuICB2YXIgdXJsID0gZ091dC5kb2NzQmFzZVVybCAmJiBvdXRwdXQudXJsICYmIGAke2dPdXQuZG9jc0Jhc2VVcmx9JHtvdXRwdXQudXJsfWAudHJpbSgpO1xuICByZXR1cm4gYCR7cHJlZml4fSAke2J1aWxkTWVzc2FnZUZyb21BcGlBbmRBcmdzKGFwaSwgYXJncyl9ICR7c3VmZml4fSAke3VybCB8fCAnJ31gLnRyaW0oKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRNZXNzYWdlRnJvbUFwaUFuZEFyZ3MoYXBpLCBhcmdzKSB7XG4gIGFwaSA9IGFycmF5aWZ5KGFwaSk7XG4gIGFyZ3MgPSBhcnJheWlmeShhcmdzKTtcbiAgdmFyIGFwaVR5cGVzID0gYXBpLm1hcChjaGVja2VyID0+IHtcbiAgICByZXR1cm4gZ2V0Q2hlY2tlckRpc3BsYXkoY2hlY2tlcik7XG4gIH0pLmpvaW4oJywgJyk7XG4gIHZhciBwYXNzZWRUeXBlcyA9IGFyZ3MubGVuZ3RoID8gJ2AnICsgYXJncy5tYXAoZ2V0QXJnRGlzcGxheSkuam9pbignLCAnKSArICdgJyA6ICdub3RoaW5nJztcbiAgcmV0dXJuICdhcGlDaGVjayBmYWlsZWQhIFlvdSBwYXNzZWQ6ICcgKyBwYXNzZWRUeXBlcyArICcgYW5kIHNob3VsZCBoYXZlIHBhc3NlZDogYCcgKyBhcGlUeXBlcyArICdgJztcbn1cblxudmFyIHN0cmluZ2lmeWFibGUgPSB7XG4gIE9iamVjdDogZ2V0RGlzcGxheSxcbiAgQXJyYXk6IGdldERpc3BsYXlcbn07XG5cbmZ1bmN0aW9uIGdldERpc3BsYXkob2JqKSB7XG4gIHZhciBhcmdEaXNwbGF5ID0ge307XG4gIGVhY2gob2JqLCAodixrKSA9PiBhcmdEaXNwbGF5W2tdID0gZ2V0QXJnRGlzcGxheSh2KSk7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmosIChrLCB2KSA9PiBhcmdEaXNwbGF5W2tdIHx8IHYpO1xufVxuXG5mdW5jdGlvbiBnZXRBcmdEaXNwbGF5KGFyZykge1xuICB2YXIgY05hbWUgPSBhcmcgJiYgYXJnLmNvbnN0cnVjdG9yICYmIGFyZy5jb25zdHJ1Y3Rvci5uYW1lO1xuICByZXR1cm4gY05hbWUgPyBzdHJpbmdpZnlhYmxlW2NOYW1lXSA/IHN0cmluZ2lmeWFibGVbY05hbWVdKGFyZykgOiBjTmFtZSA6IGFyZyA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVPZihhcmcpO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9qc2hpbnQtbG9hZGVyIS4vYXBpQ2hlY2suanNcbiAqKi8iLCJcblxubW9kdWxlLmV4cG9ydHMgPSB7ZWFjaCwgY29weSwgdHlwZU9mLCBhcnJheWlmeSwgZ2V0Q2hlY2tlckRpc3BsYXl9O1xuXG5mdW5jdGlvbiBjb3B5KG9iaikge1xuICB2YXIgZGFDb3B5ID0gQXJyYXkuaXNBcnJheShvYmopID8gW10gOiB7fTtcbiAgZWFjaChvYmosICh2YWwsIGtleSkgPT4gZGFDb3B5W2tleV0gPSB2YWwpO1xuICByZXR1cm4gZGFDb3B5O1xufVxuXG5cbmZ1bmN0aW9uIHR5cGVPZihvYmopIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgIHJldHVybiAnYXJyYXknO1xuICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIHJldHVybiAnb2JqZWN0JztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRDaGVja2VyRGlzcGxheShjaGVja2VyKSB7XG4gIHJldHVybiAoY2hlY2tlci50eXBlIHx8IGNoZWNrZXIuZGlzcGxheU5hbWUgfHwgY2hlY2tlci5uYW1lKSArIChjaGVja2VyLmlzT3B0aW9uYWwgPyAnIChvcHRpb25hbCknIDogJycpO1xufVxuXG5mdW5jdGlvbiBhcnJheWlmeShvYmopIHtcbiAgaWYgKCFvYmopIHtcbiAgICByZXR1cm4gW107XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gW29ial07XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBlYWNoKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgIHJldHVybiBlYWNoQXJyeSguLi5hcmd1bWVudHMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlYWNoT2JqKC4uLmFyZ3VtZW50cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZWFjaE9iaihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gIHZhciByZXQ7XG4gIHZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhc093bi5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgcmV0ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGVhY2hBcnJ5KG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgdmFyIHJldDtcbiAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICByZXQgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKTtcbiAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuLi9+L2pzaGludC1sb2FkZXIhLi9hcGlDaGVja1V0aWwuanNcbiAqKi8iLCJ2YXIge3R5cGVPZiwgZWFjaCwgY29weSwgZ2V0Q2hlY2tlckRpc3BsYXl9ID0gcmVxdWlyZSgnLi9hcGlDaGVja1V0aWwnKTtcbnZhciBjaGVja2VycyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBhcnJheTogZ2V0VHlwZU9mQ2hlY2tlcignYXJyYXknKSxcbiAgYm9vbDogZ2V0VHlwZU9mQ2hlY2tlcignYm9vbGVhbicpLFxuICBmdW5jOiBnZXRUeXBlT2ZDaGVja2VyKCdmdW5jdGlvbicpLFxuICBudW1iZXI6IGdldFR5cGVPZkNoZWNrZXIoJ251bWJlcicpLFxuICBzdHJpbmc6IGdldFR5cGVPZkNoZWNrZXIoJ3N0cmluZycpLFxuICBvYmplY3Q6IGdldE9iamVjdENoZWNrZXIoKSxcblxuICBpbnN0YW5jZU9mOiBpbnN0YW5jZUNoZWNrR2V0dGVyLFxuICBvbmVPZjogb25lT2ZDaGVja0dldHRlcixcbiAgb25lT2ZUeXBlOiBvbmVPZlR5cGVDaGVja0dldHRlcixcblxuICBhcnJheU9mOiBhcnJheU9mQ2hlY2tHZXR0ZXIsXG4gIG9iamVjdE9mOiBvYmplY3RPZkNoZWNrR2V0dGVyLFxuXG4gIHNoYXBlOiBnZXRTaGFwZUNoZWNrR2V0dGVyKCksXG5cbiAgYW55OiBhbnlDaGVja0dldHRlcigpXG59O1xuXG5lYWNoKGNoZWNrZXJzLCBjaGVja2VyID0+IHtcbiAgY2hlY2tlci5kaXNwbGF5TmFtZSA9IGBhcGlDaGVjayBcXGAke2NoZWNrZXIudHlwZX1cXGAgdHlwZSBjaGVja2VyYDtcbn0pO1xuXG5cbmZ1bmN0aW9uIGdldFR5cGVPZkNoZWNrZXIodHlwZSkge1xuICBmdW5jdGlvbiB0eXBlT2ZDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB0eXBlT2YodmFsKSA9PT0gdHlwZTtcbiAgfVxuXG4gIHR5cGVPZkNoZWNrZXIudHlwZSA9IHR5cGU7XG4gIG1ha2VPcHRpb25hbCh0eXBlT2ZDaGVja2VyKTtcbiAgcmV0dXJuIHR5cGVPZkNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIGdldE9iamVjdENoZWNrZXIoKSB7XG4gIGZ1bmN0aW9uIG9iamVjdE51bGxPa0NoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHR5cGVPZih2YWwpID09PSAnb2JqZWN0JztcbiAgfVxuICBvYmplY3ROdWxsT2tDaGVja2VyLnR5cGUgPSAnb2JqZWN0W251bGwgb2tdJztcbiAgbWFrZU9wdGlvbmFsKG9iamVjdE51bGxPa0NoZWNrZXIpO1xuICBmdW5jdGlvbiBvYmplY3RDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB2YWwgIT09IG51bGwgJiYgb2JqZWN0TnVsbE9rQ2hlY2tlcih2YWwpO1xuICB9XG4gIG9iamVjdENoZWNrZXIudHlwZSA9ICdvYmplY3QnO1xuICBtYWtlT3B0aW9uYWwob2JqZWN0Q2hlY2tlcik7XG4gIG9iamVjdENoZWNrZXIubnVsbE9rID0gb2JqZWN0TnVsbE9rQ2hlY2tlcjtcblxuICByZXR1cm4gb2JqZWN0Q2hlY2tlcjtcbn1cblxuXG5mdW5jdGlvbiBpbnN0YW5jZUNoZWNrR2V0dGVyKGNsYXNzVG9DaGVjaykge1xuICBmdW5jdGlvbiBpbnN0YW5jZUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCBpbnN0YW5jZW9mIGNsYXNzVG9DaGVjaztcbiAgfVxuXG4gIGluc3RhbmNlQ2hlY2tlci50eXBlID0gY2xhc3NUb0NoZWNrLm5hbWU7XG4gIG1ha2VPcHRpb25hbChpbnN0YW5jZUNoZWNrZXIpO1xuICByZXR1cm4gaW5zdGFuY2VDaGVja2VyO1xufVxuXG5mdW5jdGlvbiBvbmVPZkNoZWNrR2V0dGVyKGl0ZW1zKSB7XG4gIGZ1bmN0aW9uIG9uZU9mQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gaXRlbXMuc29tZShpdGVtID0+IGl0ZW0gPT09IHZhbCk7XG4gIH1cblxuICBvbmVPZkNoZWNrZXIudHlwZSA9IGBlbnVtWyR7aXRlbXMuam9pbignLCAnKX1dYDtcbiAgbWFrZU9wdGlvbmFsKG9uZU9mQ2hlY2tlcik7XG4gIHJldHVybiBvbmVPZkNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG9uZU9mVHlwZUNoZWNrR2V0dGVyKGNoZWNrZXJzKSB7XG4gIGZ1bmN0aW9uIG9uZU9mVHlwZUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGNoZWNrZXJzLnNvbWUoaXRlbSA9PiBpdGVtKHZhbCkpO1xuICB9XG5cbiAgb25lT2ZUeXBlQ2hlY2tlci50eXBlID0gY2hlY2tlcnMubWFwKGdldENoZWNrZXJEaXNwbGF5KS5qb2luKCcgb3IgJyk7XG4gIG1ha2VPcHRpb25hbChvbmVPZlR5cGVDaGVja2VyKTtcbiAgcmV0dXJuIG9uZU9mVHlwZUNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIGFycmF5T2ZDaGVja0dldHRlcihjaGVja2VyKSB7XG4gIGZ1bmN0aW9uIGFycmF5T2ZDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiBjaGVja2Vycy5hcnJheSh2YWwpICYmIHZhbC5ldmVyeShjaGVja2VyKTtcbiAgfVxuXG4gIGFycmF5T2ZDaGVja2VyLnR5cGUgPSBgYXJyYXlPZlske2dldENoZWNrZXJEaXNwbGF5KGNoZWNrZXIpfV1gO1xuICBtYWtlT3B0aW9uYWwoYXJyYXlPZkNoZWNrZXIpO1xuICByZXR1cm4gYXJyYXlPZkNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG9iamVjdE9mQ2hlY2tHZXR0ZXIoY2hlY2tlcikge1xuICBmdW5jdGlvbiBvYmplY3RPZkNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGNoZWNrZXJzLm9iamVjdCh2YWwpICYmIGVhY2godmFsLCBjaGVja2VyKTtcbiAgfVxuXG4gIG9iamVjdE9mQ2hlY2tlci50eXBlID0gYG9iamVjdE9mWyR7Z2V0Q2hlY2tlckRpc3BsYXkoY2hlY2tlcil9XWA7XG4gIG1ha2VPcHRpb25hbChvYmplY3RPZkNoZWNrZXIpO1xuICByZXR1cm4gb2JqZWN0T2ZDaGVja2VyO1xufVxuXG5mdW5jdGlvbiBnZXRTaGFwZUNoZWNrR2V0dGVyKCkge1xuICBmdW5jdGlvbiBzaGFwZUNoZWNrR2V0dGVyKHNoYXBlKSB7XG4gICAgZnVuY3Rpb24gc2hhcGVDaGVja2VyKHZhbCkge1xuICAgICAgcmV0dXJuIGNoZWNrZXJzLm9iamVjdCh2YWwpICYmIGVhY2goc2hhcGUsIChjaGVja2VyLCBwcm9wKSA9PiB7XG4gICAgICAgICAgaWYgKCF2YWwuaGFzT3duUHJvcGVydHkocHJvcCkgJiYgY2hlY2tlci5pc09wdGlvbmFsKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNoZWNrZXIodmFsW3Byb3BdLCBwcm9wLCB2YWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkgJiYgKCFzaGFwZUNoZWNrZXIuc3RyaWN0IHx8IGVhY2godmFsLCAocHJvcCwgbmFtZSkgPT4ge1xuICAgICAgICAgIHJldHVybiBzaGFwZS5oYXNPd25Qcm9wZXJ0eShuYW1lKTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHZhciBjb3BpZWRTaGFwZSA9IGNvcHkoc2hhcGUpO1xuICAgIGVhY2goY29waWVkU2hhcGUsICh2YWwsIHByb3ApID0+IHtcbiAgICAgIGNvcGllZFNoYXBlW3Byb3BdID0gZ2V0Q2hlY2tlckRpc3BsYXkodmFsKTtcbiAgICB9KTtcbiAgICBzaGFwZUNoZWNrZXIudHlwZSA9IGBzaGFwZSgke0pTT04uc3RyaW5naWZ5KGNvcGllZFNoYXBlKX0pYDtcbiAgICBtYWtlT3B0aW9uYWwoc2hhcGVDaGVja2VyKTtcbiAgICByZXR1cm4gc2hhcGVDaGVja2VyO1xuICB9XG5cbiAgc2hhcGVDaGVja0dldHRlci5pZk5vdCA9IGZ1bmN0aW9uIGlmTm90KG90aGVyUHJvcHMsIHByb3BDaGVja2VyKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG90aGVyUHJvcHMpKSB7XG4gICAgICBvdGhlclByb3BzID0gW290aGVyUHJvcHNdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpZk5vdENoZWNrZXIocHJvcCwgcHJvcE5hbWUsIG9iaikge1xuICAgICAgcmV0dXJuICFvdGhlclByb3BzLnNvbWUocHJvcCA9PiBvYmouaGFzT3duUHJvcGVydHkocHJvcCkpICYmIHByb3BDaGVja2VyKHByb3ApO1xuICAgIH1cbiAgICBpZk5vdENoZWNrZXIudHlwZSA9IGBpZk5vdFske290aGVyUHJvcHMuam9pbignLCAnKX1dYDtcbiAgICBtYWtlT3B0aW9uYWwoaWZOb3RDaGVja2VyKTtcbiAgICByZXR1cm4gaWZOb3RDaGVja2VyO1xuICB9O1xuXG4gIHNoYXBlQ2hlY2tHZXR0ZXIub25seUlmID0gZnVuY3Rpb24gb25seUlmKG90aGVyUHJvcHMsIHByb3BDaGVja2VyKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG90aGVyUHJvcHMpKSB7XG4gICAgICBvdGhlclByb3BzID0gW290aGVyUHJvcHNdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBvbmx5SWZDaGVja2VyKHByb3AsIHByb3BOYW1lLCBvYmopIHtcbiAgICAgIHJldHVybiBvdGhlclByb3BzLmV2ZXJ5KHByb3AgPT4gb2JqLmhhc093blByb3BlcnR5KHByb3ApKSAmJiBwcm9wQ2hlY2tlcihwcm9wKTtcbiAgICB9XG4gICAgb25seUlmQ2hlY2tlci50eXBlID0gYG9ubHlJZlske290aGVyUHJvcHMuam9pbignLCAnKX1dYDtcbiAgICBtYWtlT3B0aW9uYWwob25seUlmQ2hlY2tlcik7XG4gICAgcmV0dXJuIG9ubHlJZkNoZWNrZXI7XG4gIH07XG5cbiAgcmV0dXJuIHNoYXBlQ2hlY2tHZXR0ZXI7XG59XG5cbmZ1bmN0aW9uIGFueUNoZWNrR2V0dGVyKCkge1xuICBmdW5jdGlvbiBhbnlDaGVja2VyKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYW55Q2hlY2tlci50eXBlID0gJ2FueSc7XG4gIG1ha2VPcHRpb25hbChhbnlDaGVja2VyKTtcbiAgcmV0dXJuIGFueUNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG1ha2VPcHRpb25hbChjaGVja2VyKSB7XG4gIGNoZWNrZXIub3B0aW9uYWwgPSBmdW5jdGlvbiBvcHRpb25hbENoZWNrKCkge1xuICAgIHJldHVybiBjaGVja2VyKC4uLmFyZ3VtZW50cyk7XG4gIH07XG4gIGNoZWNrZXIub3B0aW9uYWwuaXNPcHRpb25hbCA9IHRydWU7XG4gIGNoZWNrZXIub3B0aW9uYWwudHlwZSA9IGNoZWNrZXIudHlwZTtcbiAgY2hlY2tlci5vcHRpb25hbC5kaXNwbGF5TmFtZSA9IGNoZWNrZXIuZGlzcGxheU5hbWU7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuLi9+L2pzaGludC1sb2FkZXIhLi9jaGVja2Vycy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImFwaUNoZWNrLmpzIn0=