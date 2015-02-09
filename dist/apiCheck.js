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
	  array: getTypeOfChecker("Array"),
	  bool: getTypeOfChecker("Boolean"),
	  func: getTypeOfChecker("Function"),
	  number: getTypeOfChecker("Number"),
	  string: getTypeOfChecker("String"),
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
	    return typeOf(val) === "object";
	  }
	  objectNullOkChecker.type = "Object[null ok]";
	  makeOptional(objectNullOkChecker);
	  function objectChecker(val) {
	    return val !== null && objectNullOkChecker(val);
	  }
	  objectChecker.type = "Object";
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
	
	function oneOfCheckGetter(enums) {
	  function oneOfChecker(val) {
	    return enums.some(function (enm) {
	      return enm === val;
	    });
	  }
	
	  oneOfChecker.type = "enum[" + enums.join(", ") + "]";
	  makeOptional(oneOfChecker);
	  return oneOfChecker;
	}
	
	function oneOfTypeCheckGetter(checkers) {
	  function oneOfTypeChecker(val) {
	    return checkers.some(function (checker) {
	      return checker(val);
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
	      var propExists = !obj.hasOwnProperty(propName);
	      return propExists || !otherProps.some(function (otherProp) {
	        return obj.hasOwnProperty(otherProp);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBiMWM2OTdmM2VkM2U0Njg4ZDgwMiIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9hcGlDaGVjay5qcyIsIndlYnBhY2s6Ly8vLi9hcGlDaGVja1V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vY2hlY2tlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7OztBQ3RDQSxPQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFPLENBQUMsbUJBQVksQ0FBQyxDOzs7Ozs7Ozs7OztnQkNBWSxtQkFBTyxDQUFDLHVCQUFnQixDQUFDOztLQUF0RSxJQUFJLFlBQUosSUFBSTtLQUFFLFFBQVEsWUFBUixRQUFRO0tBQUUsaUJBQWlCLFlBQWpCLGlCQUFpQjtLQUFFLE1BQU0sWUFBTixNQUFNO0FBQzlDLEtBQUksUUFBUSxHQUFHLG1CQUFPLENBQUMsbUJBQVksQ0FBQyxDQUFDO0FBQ3JDLEtBQUksUUFBUSxHQUFHLEtBQUssQ0FBQzs7QUFFckIsT0FBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7O0FBRTFCLEtBQUksb0JBQW9CLEdBQUc7QUFDekIsWUFBTyxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQ3hCLE9BQUksRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDO0FBQ3hCLFVBQU8sRUFBRTtZQUFNLFFBQVEs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OUIsaUJBQVUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO01BQzNCO0FBQ0QsY0FBUyxhQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUU7QUFDMUMsY0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLGNBQUk7Z0JBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7UUFBQSxDQUFDLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO01BQ2hGO0FBQ0Qsa0JBQWEsQ0FBQyxJQUFJLGVBQWEsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBRyxDQUFDO0FBQ3hELGlCQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDNUIsWUFBTyxhQUFhLENBQUM7SUFDdEIsQ0FBQzs7QUFFRixVQUFPLGdCQUFnQixDQUFDO0VBQ3pCOztBQUVELFVBQVMsY0FBYyxHQUFHO0FBQ3hCLFlBQVMsVUFBVSxHQUFHO0FBQ3BCLFlBQU8sSUFBSSxDQUFDO0lBQ2I7O0FBRUQsYUFBVSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7QUFDeEIsZUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3pCLFVBQU8sVUFBVSxDQUFDO0VBQ25COztBQUVELFVBQVMsWUFBWSxDQUFDLE9BQU8sRUFBRTtBQUM3QixVQUFPLENBQUMsUUFBUSxHQUFHLFNBQVMsYUFBYSxHQUFHO0FBQzFDLFlBQU8sT0FBTyxrQkFBSSxTQUFTLENBQUMsQ0FBQztJQUM5QixDQUFDO0FBQ0YsVUFBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ25DLFVBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDckMsVUFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiYXBpQ2hlY2tcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiYXBpQ2hlY2tcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBiMWM2OTdmM2VkM2U0Njg4ZDgwMlxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9hcGlDaGVjaycpO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9qc2hpbnQtbG9hZGVyIS4vaW5kZXguanNcbiAqKi8iLCJ2YXIge2VhY2gsIGFycmF5aWZ5LCBnZXRDaGVja2VyRGlzcGxheSwgdHlwZU9mfSA9IHJlcXVpcmUoJy4vYXBpQ2hlY2tVdGlsJyk7XG52YXIgY2hlY2tlcnMgPSByZXF1aXJlKCcuL2NoZWNrZXJzJyk7XG52YXIgZGlzYWJsZWQgPSBmYWxzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcGlDaGVjaztcblxudmFyIGFkZGl0aW9uYWxQcm9wZXJ0aWVzID0ge1xuICB0aHJvdzogZ2V0QXBpQ2hlY2sodHJ1ZSksXG4gIHdhcm46IGdldEFwaUNoZWNrKGZhbHNlKSxcbiAgZGlzYWJsZTogKCkgPT4gZGlzYWJsZWQgPSB0cnVlLFxuICBlbmFibGU6ICgpID0+IGRpc2FibGVkID0gZmFsc2UsXG4gIGdldEVycm9yTWVzc2FnZSxcbiAgaGFuZGxlRXJyb3JNZXNzYWdlLFxuICBjb25maWc6IHtcbiAgICBvdXRwdXQ6IHtcbiAgICAgIHByZWZpeDogJycsXG4gICAgICBzdWZmaXg6ICcnLFxuICAgICAgZG9jc0Jhc2VVcmw6ICcnXG4gICAgfVxuICB9XG59O1xuXG5lYWNoKGFkZGl0aW9uYWxQcm9wZXJ0aWVzLCAod3JhcHBlciwgbmFtZSkgPT4gbW9kdWxlLmV4cG9ydHNbbmFtZV0gPSB3cmFwcGVyKTtcbmVhY2goY2hlY2tlcnMsIChjaGVja2VyLCBuYW1lKSA9PiBtb2R1bGUuZXhwb3J0c1tuYW1lXSA9IGNoZWNrZXIpO1xuXG5cblxuZnVuY3Rpb24gYXBpQ2hlY2soYXBpLCBhcmdzLCBvdXRwdXQpIHtcbiAgLyoganNoaW50IG1heGNvbXBsZXhpdHk6NiAqL1xuICB2YXIgc3VjY2VzcztcbiAgaWYgKGRpc2FibGVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKCFhcmdzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhcGlDaGVjayBmYWlsZWQ6IE11c3QgcGFzcyBhcmd1bWVudHMgdG8gY2hlY2snKTtcbiAgfVxuICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7XG4gIGlmIChjaGVja2Vycy5hcnJheShhcGkpKSB7XG4gICAgc3VjY2VzcyA9IGNoZWNrRW5vdWdoQXJncyhhcGksIGFyZ3MpICYmIGNoZWNrTXVsdGlBcmdBcGkoYXBpLCBhcmdzKTtcbiAgfSBlbHNlIGlmIChjaGVja2Vycy5mdW5jKGFwaSkpIHtcbiAgICBzdWNjZXNzID0gYXBpKGFyZ3NbMF0pO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignYXBpQ2hlY2sgZmFpbGVkOiBNdXN0IHBhc3MgYW4gYXJyYXkgb3IgYSBmdW5jdGlvbicpO1xuICB9XG4gIHJldHVybiBzdWNjZXNzID8gbnVsbCA6IG1vZHVsZS5leHBvcnRzLmdldEVycm9yTWVzc2FnZShhcGksIGFyZ3MsIG91dHB1dCk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrTXVsdGlBcmdBcGkoYXBpLCBhcmdzKSB7XG4gIHZhciBzdWNjZXNzID0gdHJ1ZTtcbiAgdmFyIGNoZWNrZXJJbmRleCA9IDA7XG4gIHZhciBhcmdJbmRleCA9IDA7XG4gIHZhciBhcmcsIGNoZWNrZXIsIHJlcztcbiAgLyoganNoaW50IC1XMDg0ICovXG4gIHdoaWxlKGFyZyA9IGFyZ3NbYXJnSW5kZXgrK10pIHtcbiAgICBjaGVja2VyID0gYXBpW2NoZWNrZXJJbmRleCsrXTtcbiAgICByZXMgPSBjaGVja2VyKGFyZyk7XG4gICAgaWYgKCFyZXMgJiYgIWNoZWNrZXIuaXNPcHRpb25hbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoIXJlcykge1xuICAgICAgYXJnSW5kZXgtLTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmZ1bmN0aW9uIGNoZWNrRW5vdWdoQXJncyhhcGksIGFyZ3MpIHtcbiAgdmFyIHJlcXVpcmVkQXJncyA9IGFwaS5maWx0ZXIoYSA9PiAhYS5pc09wdGlvbmFsKTtcbiAgcmV0dXJuIGFyZ3MubGVuZ3RoID49IHJlcXVpcmVkQXJncy5sZW5ndGg7XG59XG5cblxuZnVuY3Rpb24gZ2V0QXBpQ2hlY2soc2hvdWxkVGhyb3cpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGFwaUNoZWNrV3JhcHBlcihhcGksIGFyZ3MsIG91dHB1dCkge1xuICAgIGlmIChkaXNhYmxlZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciBtZXNzYWdlID0gYXBpQ2hlY2soYXBpLCBhcmdzLCBvdXRwdXQpO1xuICAgIG1vZHVsZS5leHBvcnRzLmhhbmRsZUVycm9yTWVzc2FnZShtZXNzYWdlLCBzaG91bGRUaHJvdyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUVycm9yTWVzc2FnZShtZXNzYWdlLCBzaG91bGRUaHJvdykge1xuICBpZiAoc2hvdWxkVGhyb3cgJiYgbWVzc2FnZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgfSBlbHNlIGlmIChtZXNzYWdlKSB7XG4gICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEVycm9yTWVzc2FnZShhcGksIGFyZ3MsIG91dHB1dCA9IHt9KSB7XG4gIC8qIGpzaGludCBtYXhjb21wbGV4aXR5OjcgKi9cbiAgdmFyIGdPdXQgPSBtb2R1bGUuZXhwb3J0cy5jb25maWcub3V0cHV0IHx8IHt9O1xuICB2YXIgcHJlZml4ID0gYCR7Z091dC5wcmVmaXggfHwgJyd9ICR7b3V0cHV0LnByZWZpeCB8fCAnJ31gLnRyaW0oKTtcbiAgdmFyIHN1ZmZpeCA9IGAke291dHB1dC5zdWZmaXggfHwgJyd9ICR7Z091dC5zdWZmaXggfHwgJyd9YC50cmltKCk7XG4gIHZhciB1cmwgPSBnT3V0LmRvY3NCYXNlVXJsICYmIG91dHB1dC51cmwgJiYgYCR7Z091dC5kb2NzQmFzZVVybH0ke291dHB1dC51cmx9YC50cmltKCk7XG4gIHJldHVybiBgJHtwcmVmaXh9ICR7YnVpbGRNZXNzYWdlRnJvbUFwaUFuZEFyZ3MoYXBpLCBhcmdzKX0gJHtzdWZmaXh9ICR7dXJsIHx8ICcnfWAudHJpbSgpO1xufVxuXG5mdW5jdGlvbiBidWlsZE1lc3NhZ2VGcm9tQXBpQW5kQXJncyhhcGksIGFyZ3MpIHtcbiAgYXBpID0gYXJyYXlpZnkoYXBpKTtcbiAgYXJncyA9IGFycmF5aWZ5KGFyZ3MpO1xuICB2YXIgYXBpVHlwZXMgPSBhcGkubWFwKGNoZWNrZXIgPT4ge1xuICAgIHJldHVybiBnZXRDaGVja2VyRGlzcGxheShjaGVja2VyKTtcbiAgfSkuam9pbignLCAnKTtcbiAgdmFyIHBhc3NlZFR5cGVzID0gYXJncy5sZW5ndGggPyAnYCcgKyBhcmdzLm1hcChnZXRBcmdEaXNwbGF5KS5qb2luKCcsICcpICsgJ2AnIDogJ25vdGhpbmcnO1xuICByZXR1cm4gJ2FwaUNoZWNrIGZhaWxlZCEgWW91IHBhc3NlZDogJyArIHBhc3NlZFR5cGVzICsgJyBhbmQgc2hvdWxkIGhhdmUgcGFzc2VkOiBgJyArIGFwaVR5cGVzICsgJ2AnO1xufVxuXG52YXIgc3RyaW5naWZ5YWJsZSA9IHtcbiAgT2JqZWN0OiBnZXREaXNwbGF5LFxuICBBcnJheTogZ2V0RGlzcGxheVxufTtcblxuZnVuY3Rpb24gZ2V0RGlzcGxheShvYmopIHtcbiAgdmFyIGFyZ0Rpc3BsYXkgPSB7fTtcbiAgZWFjaChvYmosICh2LGspID0+IGFyZ0Rpc3BsYXlba10gPSBnZXRBcmdEaXNwbGF5KHYpKTtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgKGssIHYpID0+IGFyZ0Rpc3BsYXlba10gfHwgdik7XG59XG5cbmZ1bmN0aW9uIGdldEFyZ0Rpc3BsYXkoYXJnKSB7XG4gIHZhciBjTmFtZSA9IGFyZyAmJiBhcmcuY29uc3RydWN0b3IgJiYgYXJnLmNvbnN0cnVjdG9yLm5hbWU7XG4gIHJldHVybiBjTmFtZSA/IHN0cmluZ2lmeWFibGVbY05hbWVdID8gc3RyaW5naWZ5YWJsZVtjTmFtZV0oYXJnKSA6IGNOYW1lIDogYXJnID09PSBudWxsID8gJ251bGwnIDogdHlwZU9mKGFyZyk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuLi9+L2pzaGludC1sb2FkZXIhLi9hcGlDaGVjay5qc1xuICoqLyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IHtlYWNoLCBjb3B5LCB0eXBlT2YsIGFycmF5aWZ5LCBnZXRDaGVja2VyRGlzcGxheX07XG5cbmZ1bmN0aW9uIGNvcHkob2JqKSB7XG4gIHZhciBkYUNvcHkgPSBBcnJheS5pc0FycmF5KG9iaikgPyBbXSA6IHt9O1xuICBlYWNoKG9iaiwgKHZhbCwga2V5KSA9PiBkYUNvcHlba2V5XSA9IHZhbCk7XG4gIHJldHVybiBkYUNvcHk7XG59XG5cblxuZnVuY3Rpb24gdHlwZU9mKG9iaikge1xuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuICdhcnJheSc7XG4gIH0gZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgcmV0dXJuICdvYmplY3QnO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldENoZWNrZXJEaXNwbGF5KGNoZWNrZXIpIHtcbiAgcmV0dXJuIChjaGVja2VyLnR5cGUgfHwgY2hlY2tlci5kaXNwbGF5TmFtZSB8fCBjaGVja2VyLm5hbWUpICsgKGNoZWNrZXIuaXNPcHRpb25hbCA/ICcgKG9wdGlvbmFsKScgOiAnJyk7XG59XG5cbmZ1bmN0aW9uIGFycmF5aWZ5KG9iaikge1xuICBpZiAoIW9iaikge1xuICAgIHJldHVybiBbXTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbb2JqXTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGVhY2gob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIGVhY2hBcnJ5KC4uLmFyZ3VtZW50cyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGVhY2hPYmooLi4uYXJndW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlYWNoT2JqKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgdmFyIHJldDtcbiAgdmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICByZXQgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZWFjaEFycnkob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICB2YXIgcmV0O1xuICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHJldCA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vanNoaW50LWxvYWRlciEuL2FwaUNoZWNrVXRpbC5qc1xuICoqLyIsInZhciB7dHlwZU9mLCBlYWNoLCBjb3B5LCBnZXRDaGVja2VyRGlzcGxheX0gPSByZXF1aXJlKCcuL2FwaUNoZWNrVXRpbCcpO1xudmFyIGNoZWNrZXJzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFycmF5OiBnZXRUeXBlT2ZDaGVja2VyKCdBcnJheScpLFxuICBib29sOiBnZXRUeXBlT2ZDaGVja2VyKCdCb29sZWFuJyksXG4gIGZ1bmM6IGdldFR5cGVPZkNoZWNrZXIoJ0Z1bmN0aW9uJyksXG4gIG51bWJlcjogZ2V0VHlwZU9mQ2hlY2tlcignTnVtYmVyJyksXG4gIHN0cmluZzogZ2V0VHlwZU9mQ2hlY2tlcignU3RyaW5nJyksXG4gIG9iamVjdDogZ2V0T2JqZWN0Q2hlY2tlcigpLFxuXG4gIGluc3RhbmNlT2Y6IGluc3RhbmNlQ2hlY2tHZXR0ZXIsXG4gIG9uZU9mOiBvbmVPZkNoZWNrR2V0dGVyLFxuICBvbmVPZlR5cGU6IG9uZU9mVHlwZUNoZWNrR2V0dGVyLFxuXG4gIGFycmF5T2Y6IGFycmF5T2ZDaGVja0dldHRlcixcbiAgb2JqZWN0T2Y6IG9iamVjdE9mQ2hlY2tHZXR0ZXIsXG5cbiAgc2hhcGU6IGdldFNoYXBlQ2hlY2tHZXR0ZXIoKSxcblxuICBhbnk6IGFueUNoZWNrR2V0dGVyKClcbn07XG5cbmVhY2goY2hlY2tlcnMsIGNoZWNrZXIgPT4ge1xuICBjaGVja2VyLmRpc3BsYXlOYW1lID0gYGFwaUNoZWNrIFxcYCR7Y2hlY2tlci50eXBlfVxcYCB0eXBlIGNoZWNrZXJgO1xufSk7XG5cblxuZnVuY3Rpb24gZ2V0VHlwZU9mQ2hlY2tlcih0eXBlKSB7XG4gIHZhciBsVHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgZnVuY3Rpb24gdHlwZU9mQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdHlwZU9mKHZhbCkgPT09IGxUeXBlO1xuICB9XG5cbiAgdHlwZU9mQ2hlY2tlci50eXBlID0gdHlwZTtcbiAgbWFrZU9wdGlvbmFsKHR5cGVPZkNoZWNrZXIpO1xuICByZXR1cm4gdHlwZU9mQ2hlY2tlcjtcbn1cblxuZnVuY3Rpb24gZ2V0T2JqZWN0Q2hlY2tlcigpIHtcbiAgZnVuY3Rpb24gb2JqZWN0TnVsbE9rQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdHlwZU9mKHZhbCkgPT09ICdvYmplY3QnO1xuICB9XG4gIG9iamVjdE51bGxPa0NoZWNrZXIudHlwZSA9ICdPYmplY3RbbnVsbCBva10nO1xuICBtYWtlT3B0aW9uYWwob2JqZWN0TnVsbE9rQ2hlY2tlcik7XG4gIGZ1bmN0aW9uIG9iamVjdENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiBvYmplY3ROdWxsT2tDaGVja2VyKHZhbCk7XG4gIH1cbiAgb2JqZWN0Q2hlY2tlci50eXBlID0gJ09iamVjdCc7XG4gIG1ha2VPcHRpb25hbChvYmplY3RDaGVja2VyKTtcbiAgb2JqZWN0Q2hlY2tlci5udWxsT2sgPSBvYmplY3ROdWxsT2tDaGVja2VyO1xuXG4gIHJldHVybiBvYmplY3RDaGVja2VyO1xufVxuXG5cbmZ1bmN0aW9uIGluc3RhbmNlQ2hlY2tHZXR0ZXIoY2xhc3NUb0NoZWNrKSB7XG4gIGZ1bmN0aW9uIGluc3RhbmNlQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsIGluc3RhbmNlb2YgY2xhc3NUb0NoZWNrO1xuICB9XG5cbiAgaW5zdGFuY2VDaGVja2VyLnR5cGUgPSBjbGFzc1RvQ2hlY2submFtZTtcbiAgbWFrZU9wdGlvbmFsKGluc3RhbmNlQ2hlY2tlcik7XG4gIHJldHVybiBpbnN0YW5jZUNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG9uZU9mQ2hlY2tHZXR0ZXIoZW51bXMpIHtcbiAgZnVuY3Rpb24gb25lT2ZDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiBlbnVtcy5zb21lKGVubSA9PiBlbm0gPT09IHZhbCk7XG4gIH1cblxuICBvbmVPZkNoZWNrZXIudHlwZSA9IGBlbnVtWyR7ZW51bXMuam9pbignLCAnKX1dYDtcbiAgbWFrZU9wdGlvbmFsKG9uZU9mQ2hlY2tlcik7XG4gIHJldHVybiBvbmVPZkNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG9uZU9mVHlwZUNoZWNrR2V0dGVyKGNoZWNrZXJzKSB7XG4gIGZ1bmN0aW9uIG9uZU9mVHlwZUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGNoZWNrZXJzLnNvbWUoY2hlY2tlciA9PiBjaGVja2VyKHZhbCkpO1xuICB9XG5cbiAgb25lT2ZUeXBlQ2hlY2tlci50eXBlID0gY2hlY2tlcnMubWFwKGdldENoZWNrZXJEaXNwbGF5KS5qb2luKCcgb3IgJyk7XG4gIG1ha2VPcHRpb25hbChvbmVPZlR5cGVDaGVja2VyKTtcbiAgcmV0dXJuIG9uZU9mVHlwZUNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIGFycmF5T2ZDaGVja0dldHRlcihjaGVja2VyKSB7XG4gIGZ1bmN0aW9uIGFycmF5T2ZDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiBjaGVja2Vycy5hcnJheSh2YWwpICYmIHZhbC5ldmVyeShjaGVja2VyKTtcbiAgfVxuXG4gIGFycmF5T2ZDaGVja2VyLnR5cGUgPSBgYXJyYXlPZlske2dldENoZWNrZXJEaXNwbGF5KGNoZWNrZXIpfV1gO1xuICBtYWtlT3B0aW9uYWwoYXJyYXlPZkNoZWNrZXIpO1xuICByZXR1cm4gYXJyYXlPZkNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG9iamVjdE9mQ2hlY2tHZXR0ZXIoY2hlY2tlcikge1xuICBmdW5jdGlvbiBvYmplY3RPZkNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGNoZWNrZXJzLm9iamVjdCh2YWwpICYmIGVhY2godmFsLCBjaGVja2VyKTtcbiAgfVxuXG4gIG9iamVjdE9mQ2hlY2tlci50eXBlID0gYG9iamVjdE9mWyR7Z2V0Q2hlY2tlckRpc3BsYXkoY2hlY2tlcil9XWA7XG4gIG1ha2VPcHRpb25hbChvYmplY3RPZkNoZWNrZXIpO1xuICByZXR1cm4gb2JqZWN0T2ZDaGVja2VyO1xufVxuXG5mdW5jdGlvbiBnZXRTaGFwZUNoZWNrR2V0dGVyKCkge1xuICBmdW5jdGlvbiBzaGFwZUNoZWNrR2V0dGVyKHNoYXBlKSB7XG4gICAgZnVuY3Rpb24gc2hhcGVDaGVja2VyKHZhbCkge1xuICAgICAgcmV0dXJuIGNoZWNrZXJzLm9iamVjdCh2YWwpICYmIGVhY2goc2hhcGUsIChjaGVja2VyLCBwcm9wKSA9PiB7XG4gICAgICAgICAgaWYgKCF2YWwuaGFzT3duUHJvcGVydHkocHJvcCkgJiYgY2hlY2tlci5pc09wdGlvbmFsKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNoZWNrZXIodmFsW3Byb3BdLCBwcm9wLCB2YWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkgJiYgKCFzaGFwZUNoZWNrZXIuc3RyaWN0IHx8IGVhY2godmFsLCAocHJvcCwgbmFtZSkgPT4ge1xuICAgICAgICAgIHJldHVybiBzaGFwZS5oYXNPd25Qcm9wZXJ0eShuYW1lKTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHZhciBjb3BpZWRTaGFwZSA9IGNvcHkoc2hhcGUpO1xuICAgIGVhY2goY29waWVkU2hhcGUsICh2YWwsIHByb3ApID0+IHtcbiAgICAgIGNvcGllZFNoYXBlW3Byb3BdID0gZ2V0Q2hlY2tlckRpc3BsYXkodmFsKTtcbiAgICB9KTtcbiAgICBzaGFwZUNoZWNrZXIudHlwZSA9IGBzaGFwZSgke0pTT04uc3RyaW5naWZ5KGNvcGllZFNoYXBlKX0pYDtcbiAgICBtYWtlT3B0aW9uYWwoc2hhcGVDaGVja2VyKTtcbiAgICByZXR1cm4gc2hhcGVDaGVja2VyO1xuICB9XG5cbiAgc2hhcGVDaGVja0dldHRlci5pZk5vdCA9IGZ1bmN0aW9uIGlmTm90KG90aGVyUHJvcHMsIHByb3BDaGVja2VyKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG90aGVyUHJvcHMpKSB7XG4gICAgICBvdGhlclByb3BzID0gW290aGVyUHJvcHNdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpZk5vdENoZWNrZXIocHJvcCwgcHJvcE5hbWUsIG9iaikge1xuICAgICAgdmFyIHByb3BFeGlzdHMgPSAhb2JqLmhhc093blByb3BlcnR5KHByb3BOYW1lKTtcbiAgICAgIHJldHVybiBwcm9wRXhpc3RzIHx8ICghb3RoZXJQcm9wcy5zb21lKG90aGVyUHJvcCA9PiBvYmouaGFzT3duUHJvcGVydHkob3RoZXJQcm9wKSkgJiYgcHJvcENoZWNrZXIocHJvcCkpO1xuICAgIH1cbiAgICBpZk5vdENoZWNrZXIudHlwZSA9IGBpZk5vdFske290aGVyUHJvcHMuam9pbignLCAnKX1dYDtcbiAgICBtYWtlT3B0aW9uYWwoaWZOb3RDaGVja2VyKTtcbiAgICByZXR1cm4gaWZOb3RDaGVja2VyO1xuICB9O1xuXG4gIHNoYXBlQ2hlY2tHZXR0ZXIub25seUlmID0gZnVuY3Rpb24gb25seUlmKG90aGVyUHJvcHMsIHByb3BDaGVja2VyKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG90aGVyUHJvcHMpKSB7XG4gICAgICBvdGhlclByb3BzID0gW290aGVyUHJvcHNdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBvbmx5SWZDaGVja2VyKHByb3AsIHByb3BOYW1lLCBvYmopIHtcbiAgICAgIHJldHVybiBvdGhlclByb3BzLmV2ZXJ5KHByb3AgPT4gb2JqLmhhc093blByb3BlcnR5KHByb3ApKSAmJiBwcm9wQ2hlY2tlcihwcm9wKTtcbiAgICB9XG4gICAgb25seUlmQ2hlY2tlci50eXBlID0gYG9ubHlJZlske290aGVyUHJvcHMuam9pbignLCAnKX1dYDtcbiAgICBtYWtlT3B0aW9uYWwob25seUlmQ2hlY2tlcik7XG4gICAgcmV0dXJuIG9ubHlJZkNoZWNrZXI7XG4gIH07XG5cbiAgcmV0dXJuIHNoYXBlQ2hlY2tHZXR0ZXI7XG59XG5cbmZ1bmN0aW9uIGFueUNoZWNrR2V0dGVyKCkge1xuICBmdW5jdGlvbiBhbnlDaGVja2VyKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYW55Q2hlY2tlci50eXBlID0gJ2FueSc7XG4gIG1ha2VPcHRpb25hbChhbnlDaGVja2VyKTtcbiAgcmV0dXJuIGFueUNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG1ha2VPcHRpb25hbChjaGVja2VyKSB7XG4gIGNoZWNrZXIub3B0aW9uYWwgPSBmdW5jdGlvbiBvcHRpb25hbENoZWNrKCkge1xuICAgIHJldHVybiBjaGVja2VyKC4uLmFyZ3VtZW50cyk7XG4gIH07XG4gIGNoZWNrZXIub3B0aW9uYWwuaXNPcHRpb25hbCA9IHRydWU7XG4gIGNoZWNrZXIub3B0aW9uYWwudHlwZSA9IGNoZWNrZXIudHlwZTtcbiAgY2hlY2tlci5vcHRpb25hbC5kaXNwbGF5TmFtZSA9IGNoZWNrZXIuZGlzcGxheU5hbWU7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuLi9+L2pzaGludC1sb2FkZXIhLi9jaGVja2Vycy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImFwaUNoZWNrLmpzIn0=