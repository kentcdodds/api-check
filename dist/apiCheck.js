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
	    return getCheckerDisplay(checker) + (checker.isOptional ? " (optional)" : "");
	  }).join(", ");
	  var passedTypes = args.length ? "`" + args.map(typeOf).join(", ") + "`" : "nothing";
	  return "apiCheck failed! You passed: " + passedTypes + " and should have passed: `" + apiTypes + "`";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAwZjc4NmY0YmY5Yjc1YjkzNWY1NSIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9hcGlDaGVjay5qcyIsIndlYnBhY2s6Ly8vLi9hcGlDaGVja1V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vY2hlY2tlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7OztBQ3RDQSxPQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFPLENBQUMsbUJBQVksQ0FBQyxDOzs7Ozs7Ozs7OztnQkNBWSxtQkFBTyxDQUFDLHVCQUFnQixDQUFDOztLQUF0RSxJQUFJLFlBQUosSUFBSTtLQUFFLFFBQVEsWUFBUixRQUFRO0tBQUUsaUJBQWlCLFlBQWpCLGlCQUFpQjtLQUFFLE1BQU0sWUFBTixNQUFNO0FBQzlDLEtBQUksUUFBUSxHQUFHLG1CQUFPLENBQUMsbUJBQVksQ0FBQyxDQUFDO0FBQ3JDLEtBQUksUUFBUSxHQUFHLEtBQUssQ0FBQzs7QUFFckIsT0FBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7O0FBRTFCLEtBQUksb0JBQW9CLEdBQUc7QUFDekIsWUFBTyxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQ3hCLE9BQUksRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDO0FBQ3hCLFVBQU8sRUFBRTtZQUFNLFFBQVEs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QUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJhcGlDaGVja1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJhcGlDaGVja1wiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIFxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvblxuICoqLyIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDBmNzg2ZjRiZjliNzViOTM1ZjU1XG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2FwaUNoZWNrJyk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuLi9+L2pzaGludC1sb2FkZXIhLi9pbmRleC5qc1xuICoqLyIsInZhciB7ZWFjaCwgYXJyYXlpZnksIGdldENoZWNrZXJEaXNwbGF5LCB0eXBlT2Z9ID0gcmVxdWlyZSgnLi9hcGlDaGVja1V0aWwnKTtcbnZhciBjaGVja2VycyA9IHJlcXVpcmUoJy4vY2hlY2tlcnMnKTtcbnZhciBkaXNhYmxlZCA9IGZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwaUNoZWNrO1xuXG52YXIgYWRkaXRpb25hbFByb3BlcnRpZXMgPSB7XG4gIHRocm93OiBnZXRBcGlDaGVjayh0cnVlKSxcbiAgd2FybjogZ2V0QXBpQ2hlY2soZmFsc2UpLFxuICBkaXNhYmxlOiAoKSA9PiBkaXNhYmxlZCA9IHRydWUsXG4gIGVuYWJsZTogKCkgPT4gZGlzYWJsZWQgPSBmYWxzZSxcbiAgZ2V0RXJyb3JNZXNzYWdlLFxuICBoYW5kbGVFcnJvck1lc3NhZ2UsXG4gIGNvbmZpZzoge1xuICAgIG91dHB1dDoge1xuICAgICAgcHJlZml4OiAnJyxcbiAgICAgIHN1ZmZpeDogJycsXG4gICAgICBkb2NzQmFzZVVybDogJydcbiAgICB9XG4gIH1cbn07XG5cbmVhY2goYWRkaXRpb25hbFByb3BlcnRpZXMsICh3cmFwcGVyLCBuYW1lKSA9PiBtb2R1bGUuZXhwb3J0c1tuYW1lXSA9IHdyYXBwZXIpO1xuZWFjaChjaGVja2VycywgKGNoZWNrZXIsIG5hbWUpID0+IG1vZHVsZS5leHBvcnRzW25hbWVdID0gY2hlY2tlcik7XG5cblxuXG5mdW5jdGlvbiBhcGlDaGVjayhhcGksIGFyZ3MsIG91dHB1dCkge1xuICAvKiBqc2hpbnQgbWF4Y29tcGxleGl0eTo2ICovXG4gIHZhciBzdWNjZXNzO1xuICBpZiAoZGlzYWJsZWQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoIWFyZ3MpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FwaUNoZWNrIGZhaWxlZDogTXVzdCBwYXNzIGFyZ3VtZW50cyB0byBjaGVjaycpO1xuICB9XG4gIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKTtcbiAgaWYgKGNoZWNrZXJzLmFycmF5KGFwaSkpIHtcbiAgICBzdWNjZXNzID0gY2hlY2tFbm91Z2hBcmdzKGFwaSwgYXJncykgJiYgY2hlY2tNdWx0aUFyZ0FwaShhcGksIGFyZ3MpO1xuICB9IGVsc2UgaWYgKGNoZWNrZXJzLmZ1bmMoYXBpKSkge1xuICAgIHN1Y2Nlc3MgPSBhcGkoYXJnc1swXSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhcGlDaGVjayBmYWlsZWQ6IE11c3QgcGFzcyBhbiBhcnJheSBvciBhIGZ1bmN0aW9uJyk7XG4gIH1cbiAgcmV0dXJuIHN1Y2Nlc3MgPyBudWxsIDogbW9kdWxlLmV4cG9ydHMuZ2V0RXJyb3JNZXNzYWdlKGFwaSwgYXJncywgb3V0cHV0KTtcbn1cblxuZnVuY3Rpb24gY2hlY2tNdWx0aUFyZ0FwaShhcGksIGFyZ3MpIHtcbiAgdmFyIHN1Y2Nlc3MgPSB0cnVlO1xuICB2YXIgY2hlY2tlckluZGV4ID0gMDtcbiAgdmFyIGFyZ0luZGV4ID0gMDtcbiAgdmFyIGFyZywgY2hlY2tlciwgcmVzO1xuICAvKiBqc2hpbnQgLVcwODQgKi9cbiAgd2hpbGUoYXJnID0gYXJnc1thcmdJbmRleCsrXSkge1xuICAgIGNoZWNrZXIgPSBhcGlbY2hlY2tlckluZGV4KytdO1xuICAgIHJlcyA9IGNoZWNrZXIoYXJnKTtcbiAgICBpZiAoIXJlcyAmJiAhY2hlY2tlci5pc09wdGlvbmFsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICghcmVzKSB7XG4gICAgICBhcmdJbmRleC0tO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZnVuY3Rpb24gY2hlY2tFbm91Z2hBcmdzKGFwaSwgYXJncykge1xuICB2YXIgcmVxdWlyZWRBcmdzID0gYXBpLmZpbHRlcihhID0+ICFhLmlzT3B0aW9uYWwpO1xuICByZXR1cm4gYXJncy5sZW5ndGggPj0gcmVxdWlyZWRBcmdzLmxlbmd0aDtcbn1cblxuXG5mdW5jdGlvbiBnZXRBcGlDaGVjayhzaG91bGRUaHJvdykge1xuICByZXR1cm4gZnVuY3Rpb24gYXBpQ2hlY2tXcmFwcGVyKGFwaSwgYXJncywgb3V0cHV0KSB7XG4gICAgaWYgKGRpc2FibGVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIG1lc3NhZ2UgPSBhcGlDaGVjayhhcGksIGFyZ3MsIG91dHB1dCk7XG4gICAgbW9kdWxlLmV4cG9ydHMuaGFuZGxlRXJyb3JNZXNzYWdlKG1lc3NhZ2UsIHNob3VsZFRocm93KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlRXJyb3JNZXNzYWdlKG1lc3NhZ2UsIHNob3VsZFRocm93KSB7XG4gIGlmIChzaG91bGRUaHJvdyAmJiBtZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICB9IGVsc2UgaWYgKG1lc3NhZ2UpIHtcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RXJyb3JNZXNzYWdlKGFwaSwgYXJncywgb3V0cHV0ID0ge30pIHtcbiAgLyoganNoaW50IG1heGNvbXBsZXhpdHk6NyAqL1xuICB2YXIgZ091dCA9IG1vZHVsZS5leHBvcnRzLmNvbmZpZy5vdXRwdXQgfHwge307XG4gIHZhciBwcmVmaXggPSBgJHtnT3V0LnByZWZpeCB8fCAnJ30gJHtvdXRwdXQucHJlZml4IHx8ICcnfWAudHJpbSgpO1xuICB2YXIgc3VmZml4ID0gYCR7b3V0cHV0LnN1ZmZpeCB8fCAnJ30gJHtnT3V0LnN1ZmZpeCB8fCAnJ31gLnRyaW0oKTtcbiAgdmFyIHVybCA9IGdPdXQuZG9jc0Jhc2VVcmwgJiYgb3V0cHV0LnVybCAmJiBgJHtnT3V0LmRvY3NCYXNlVXJsfSR7b3V0cHV0LnVybH1gLnRyaW0oKTtcbiAgcmV0dXJuIGAke3ByZWZpeH0gJHtidWlsZE1lc3NhZ2VGcm9tQXBpQW5kQXJncyhhcGksIGFyZ3MpfSAke3N1ZmZpeH0gJHt1cmwgfHwgJyd9YC50cmltKCk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkTWVzc2FnZUZyb21BcGlBbmRBcmdzKGFwaSwgYXJncykge1xuICBhcGkgPSBhcnJheWlmeShhcGkpO1xuICBhcmdzID0gYXJyYXlpZnkoYXJncyk7XG4gIHZhciBhcGlUeXBlcyA9IGFwaS5tYXAoY2hlY2tlciA9PiB7XG4gICAgcmV0dXJuIGdldENoZWNrZXJEaXNwbGF5KGNoZWNrZXIpICsgKGNoZWNrZXIuaXNPcHRpb25hbCA/ICcgKG9wdGlvbmFsKScgOiAnJyk7XG4gIH0pLmpvaW4oJywgJyk7XG4gIHZhciBwYXNzZWRUeXBlcyA9IGFyZ3MubGVuZ3RoID8gJ2AnICsgYXJncy5tYXAodHlwZU9mKS5qb2luKCcsICcpICsgJ2AnIDogJ25vdGhpbmcnO1xuICByZXR1cm4gJ2FwaUNoZWNrIGZhaWxlZCEgWW91IHBhc3NlZDogJyArIHBhc3NlZFR5cGVzICsgJyBhbmQgc2hvdWxkIGhhdmUgcGFzc2VkOiBgJyArIGFwaVR5cGVzICsgJ2AnO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9qc2hpbnQtbG9hZGVyIS4vYXBpQ2hlY2suanNcbiAqKi8iLCJcblxubW9kdWxlLmV4cG9ydHMgPSB7ZWFjaCwgY29weSwgdHlwZU9mLCBhcnJheWlmeSwgZ2V0Q2hlY2tlckRpc3BsYXl9O1xuXG5mdW5jdGlvbiBjb3B5KG9iaikge1xuICB2YXIgZGFDb3B5ID0gQXJyYXkuaXNBcnJheShvYmopID8gW10gOiB7fTtcbiAgZWFjaChvYmosICh2YWwsIGtleSkgPT4gZGFDb3B5W2tleV0gPSB2YWwpO1xuICByZXR1cm4gZGFDb3B5O1xufVxuXG5cbmZ1bmN0aW9uIHR5cGVPZihvYmopIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgIHJldHVybiAnYXJyYXknO1xuICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIHJldHVybiAnb2JqZWN0JztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRDaGVja2VyRGlzcGxheShjaGVja2VyKSB7XG4gIHJldHVybiBjaGVja2VyLnR5cGUgfHwgY2hlY2tlci5kaXNwbGF5TmFtZSB8fCBjaGVja2VyLm5hbWU7XG59XG5cbmZ1bmN0aW9uIGFycmF5aWZ5KG9iaikge1xuICBpZiAoIW9iaikge1xuICAgIHJldHVybiBbXTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbb2JqXTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGVhY2gob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIGVhY2hBcnJ5KC4uLmFyZ3VtZW50cyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGVhY2hPYmooLi4uYXJndW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlYWNoT2JqKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgdmFyIHJldDtcbiAgdmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICByZXQgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZWFjaEFycnkob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICB2YXIgcmV0O1xuICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHJldCA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vanNoaW50LWxvYWRlciEuL2FwaUNoZWNrVXRpbC5qc1xuICoqLyIsInZhciB7dHlwZU9mLCBlYWNoLCBjb3B5LCBnZXRDaGVja2VyRGlzcGxheX0gPSByZXF1aXJlKCcuL2FwaUNoZWNrVXRpbCcpO1xudmFyIGNoZWNrZXJzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFycmF5OiBnZXRUeXBlT2ZDaGVja2VyKCdhcnJheScpLFxuICBib29sOiBnZXRUeXBlT2ZDaGVja2VyKCdib29sZWFuJyksXG4gIGZ1bmM6IGdldFR5cGVPZkNoZWNrZXIoJ2Z1bmN0aW9uJyksXG4gIG51bWJlcjogZ2V0VHlwZU9mQ2hlY2tlcignbnVtYmVyJyksXG4gIHN0cmluZzogZ2V0VHlwZU9mQ2hlY2tlcignc3RyaW5nJyksXG4gIG9iamVjdDogZ2V0T2JqZWN0Q2hlY2tlcigpLFxuXG4gIGluc3RhbmNlT2Y6IGluc3RhbmNlQ2hlY2tHZXR0ZXIsXG4gIG9uZU9mOiBvbmVPZkNoZWNrR2V0dGVyLFxuICBvbmVPZlR5cGU6IG9uZU9mVHlwZUNoZWNrR2V0dGVyLFxuXG4gIGFycmF5T2Y6IGFycmF5T2ZDaGVja0dldHRlcixcbiAgb2JqZWN0T2Y6IG9iamVjdE9mQ2hlY2tHZXR0ZXIsXG5cbiAgc2hhcGU6IGdldFNoYXBlQ2hlY2tHZXR0ZXIoKSxcblxuICBhbnk6IGFueUNoZWNrR2V0dGVyKClcbn07XG5cbmVhY2goY2hlY2tlcnMsIGNoZWNrZXIgPT4ge1xuICBjaGVja2VyLmRpc3BsYXlOYW1lID0gYGFwaUNoZWNrIFxcYCR7Y2hlY2tlci50eXBlfVxcYCB0eXBlIGNoZWNrZXJgO1xufSk7XG5cblxuZnVuY3Rpb24gZ2V0VHlwZU9mQ2hlY2tlcih0eXBlKSB7XG4gIGZ1bmN0aW9uIHR5cGVPZkNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHR5cGVPZih2YWwpID09PSB0eXBlO1xuICB9XG5cbiAgdHlwZU9mQ2hlY2tlci50eXBlID0gdHlwZTtcbiAgbWFrZU9wdGlvbmFsKHR5cGVPZkNoZWNrZXIpO1xuICByZXR1cm4gdHlwZU9mQ2hlY2tlcjtcbn1cblxuZnVuY3Rpb24gZ2V0T2JqZWN0Q2hlY2tlcigpIHtcbiAgZnVuY3Rpb24gb2JqZWN0TnVsbE9rQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdHlwZU9mKHZhbCkgPT09ICdvYmplY3QnO1xuICB9XG4gIG9iamVjdE51bGxPa0NoZWNrZXIudHlwZSA9ICdvYmplY3RbbnVsbCBva10nO1xuICBtYWtlT3B0aW9uYWwob2JqZWN0TnVsbE9rQ2hlY2tlcik7XG4gIGZ1bmN0aW9uIG9iamVjdENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiBvYmplY3ROdWxsT2tDaGVja2VyKHZhbCk7XG4gIH1cbiAgb2JqZWN0Q2hlY2tlci50eXBlID0gJ29iamVjdCc7XG4gIG1ha2VPcHRpb25hbChvYmplY3RDaGVja2VyKTtcbiAgb2JqZWN0Q2hlY2tlci5udWxsT2sgPSBvYmplY3ROdWxsT2tDaGVja2VyO1xuXG4gIHJldHVybiBvYmplY3RDaGVja2VyO1xufVxuXG5cbmZ1bmN0aW9uIGluc3RhbmNlQ2hlY2tHZXR0ZXIoY2xhc3NUb0NoZWNrKSB7XG4gIGZ1bmN0aW9uIGluc3RhbmNlQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsIGluc3RhbmNlb2YgY2xhc3NUb0NoZWNrO1xuICB9XG5cbiAgaW5zdGFuY2VDaGVja2VyLnR5cGUgPSBjbGFzc1RvQ2hlY2submFtZTtcbiAgbWFrZU9wdGlvbmFsKGluc3RhbmNlQ2hlY2tlcik7XG4gIHJldHVybiBpbnN0YW5jZUNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG9uZU9mQ2hlY2tHZXR0ZXIoaXRlbXMpIHtcbiAgZnVuY3Rpb24gb25lT2ZDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiBpdGVtcy5zb21lKGl0ZW0gPT4gaXRlbSA9PT0gdmFsKTtcbiAgfVxuXG4gIG9uZU9mQ2hlY2tlci50eXBlID0gYGVudW1bJHtpdGVtcy5qb2luKCcsICcpfV1gO1xuICBtYWtlT3B0aW9uYWwob25lT2ZDaGVja2VyKTtcbiAgcmV0dXJuIG9uZU9mQ2hlY2tlcjtcbn1cblxuZnVuY3Rpb24gb25lT2ZUeXBlQ2hlY2tHZXR0ZXIoY2hlY2tlcnMpIHtcbiAgZnVuY3Rpb24gb25lT2ZUeXBlQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gY2hlY2tlcnMuc29tZShpdGVtID0+IGl0ZW0odmFsKSk7XG4gIH1cblxuICBvbmVPZlR5cGVDaGVja2VyLnR5cGUgPSBjaGVja2Vycy5tYXAoZ2V0Q2hlY2tlckRpc3BsYXkpLmpvaW4oJyBvciAnKTtcbiAgbWFrZU9wdGlvbmFsKG9uZU9mVHlwZUNoZWNrZXIpO1xuICByZXR1cm4gb25lT2ZUeXBlQ2hlY2tlcjtcbn1cblxuZnVuY3Rpb24gYXJyYXlPZkNoZWNrR2V0dGVyKGNoZWNrZXIpIHtcbiAgZnVuY3Rpb24gYXJyYXlPZkNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGNoZWNrZXJzLmFycmF5KHZhbCkgJiYgdmFsLmV2ZXJ5KGNoZWNrZXIpO1xuICB9XG5cbiAgYXJyYXlPZkNoZWNrZXIudHlwZSA9IGBhcnJheU9mWyR7Z2V0Q2hlY2tlckRpc3BsYXkoY2hlY2tlcil9XWA7XG4gIG1ha2VPcHRpb25hbChhcnJheU9mQ2hlY2tlcik7XG4gIHJldHVybiBhcnJheU9mQ2hlY2tlcjtcbn1cblxuZnVuY3Rpb24gb2JqZWN0T2ZDaGVja0dldHRlcihjaGVja2VyKSB7XG4gIGZ1bmN0aW9uIG9iamVjdE9mQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gY2hlY2tlcnMub2JqZWN0KHZhbCkgJiYgZWFjaCh2YWwsIGNoZWNrZXIpO1xuICB9XG5cbiAgb2JqZWN0T2ZDaGVja2VyLnR5cGUgPSBgb2JqZWN0T2ZbJHtnZXRDaGVja2VyRGlzcGxheShjaGVja2VyKX1dYDtcbiAgbWFrZU9wdGlvbmFsKG9iamVjdE9mQ2hlY2tlcik7XG4gIHJldHVybiBvYmplY3RPZkNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIGdldFNoYXBlQ2hlY2tHZXR0ZXIoKSB7XG4gIGZ1bmN0aW9uIHNoYXBlQ2hlY2tHZXR0ZXIoc2hhcGUpIHtcbiAgICBmdW5jdGlvbiBzaGFwZUNoZWNrZXIodmFsKSB7XG4gICAgICByZXR1cm4gY2hlY2tlcnMub2JqZWN0KHZhbCkgJiYgZWFjaChzaGFwZSwgKGNoZWNrZXIsIHByb3ApID0+IHtcbiAgICAgICAgICBpZiAoIXZhbC5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiBjaGVja2VyLmlzT3B0aW9uYWwpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY2hlY2tlcih2YWxbcHJvcF0sIHByb3AsIHZhbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSAmJiAoIXNoYXBlQ2hlY2tlci5zdHJpY3QgfHwgZWFjaCh2YWwsIChwcm9wLCBuYW1lKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHNoYXBlLmhhc093blByb3BlcnR5KG5hbWUpO1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgdmFyIGNvcGllZFNoYXBlID0gY29weShzaGFwZSk7XG4gICAgZWFjaChjb3BpZWRTaGFwZSwgKHZhbCwgcHJvcCkgPT4ge1xuICAgICAgY29waWVkU2hhcGVbcHJvcF0gPSBnZXRDaGVja2VyRGlzcGxheSh2YWwpO1xuICAgIH0pO1xuICAgIHNoYXBlQ2hlY2tlci50eXBlID0gYHNoYXBlKCR7SlNPTi5zdHJpbmdpZnkoY29waWVkU2hhcGUpfSlgO1xuICAgIG1ha2VPcHRpb25hbChzaGFwZUNoZWNrZXIpO1xuICAgIHJldHVybiBzaGFwZUNoZWNrZXI7XG4gIH1cblxuICBzaGFwZUNoZWNrR2V0dGVyLmlmTm90ID0gZnVuY3Rpb24gaWZOb3Qob3RoZXJQcm9wcywgcHJvcENoZWNrZXIpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkob3RoZXJQcm9wcykpIHtcbiAgICAgIG90aGVyUHJvcHMgPSBbb3RoZXJQcm9wc107XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlmTm90Q2hlY2tlcihwcm9wLCBwcm9wTmFtZSwgb2JqKSB7XG4gICAgICByZXR1cm4gIW90aGVyUHJvcHMuc29tZShwcm9wID0+IG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkgJiYgcHJvcENoZWNrZXIocHJvcCk7XG4gICAgfVxuICAgIGlmTm90Q2hlY2tlci50eXBlID0gYGlmTm90WyR7b3RoZXJQcm9wcy5qb2luKCcsICcpfV1gO1xuICAgIG1ha2VPcHRpb25hbChpZk5vdENoZWNrZXIpO1xuICAgIHJldHVybiBpZk5vdENoZWNrZXI7XG4gIH07XG5cbiAgc2hhcGVDaGVja0dldHRlci5vbmx5SWYgPSBmdW5jdGlvbiBvbmx5SWYob3RoZXJQcm9wcywgcHJvcENoZWNrZXIpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkob3RoZXJQcm9wcykpIHtcbiAgICAgIG90aGVyUHJvcHMgPSBbb3RoZXJQcm9wc107XG4gICAgfVxuICAgIGZ1bmN0aW9uIG9ubHlJZkNoZWNrZXIocHJvcCwgcHJvcE5hbWUsIG9iaikge1xuICAgICAgcmV0dXJuIG90aGVyUHJvcHMuZXZlcnkocHJvcCA9PiBvYmouaGFzT3duUHJvcGVydHkocHJvcCkpICYmIHByb3BDaGVja2VyKHByb3ApO1xuICAgIH1cbiAgICBvbmx5SWZDaGVja2VyLnR5cGUgPSBgb25seUlmWyR7b3RoZXJQcm9wcy5qb2luKCcsICcpfV1gO1xuICAgIG1ha2VPcHRpb25hbChvbmx5SWZDaGVja2VyKTtcbiAgICByZXR1cm4gb25seUlmQ2hlY2tlcjtcbiAgfTtcblxuICByZXR1cm4gc2hhcGVDaGVja0dldHRlcjtcbn1cblxuZnVuY3Rpb24gYW55Q2hlY2tHZXR0ZXIoKSB7XG4gIGZ1bmN0aW9uIGFueUNoZWNrZXIoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhbnlDaGVja2VyLnR5cGUgPSAnYW55JztcbiAgbWFrZU9wdGlvbmFsKGFueUNoZWNrZXIpO1xuICByZXR1cm4gYW55Q2hlY2tlcjtcbn1cblxuZnVuY3Rpb24gbWFrZU9wdGlvbmFsKGNoZWNrZXIpIHtcbiAgY2hlY2tlci5vcHRpb25hbCA9IGZ1bmN0aW9uIG9wdGlvbmFsQ2hlY2soKSB7XG4gICAgcmV0dXJuIGNoZWNrZXIoLi4uYXJndW1lbnRzKTtcbiAgfTtcbiAgY2hlY2tlci5vcHRpb25hbC5pc09wdGlvbmFsID0gdHJ1ZTtcbiAgY2hlY2tlci5vcHRpb25hbC50eXBlID0gY2hlY2tlci50eXBlO1xuICBjaGVja2VyLm9wdGlvbmFsLmRpc3BsYXlOYW1lID0gY2hlY2tlci5kaXNwbGF5TmFtZTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vanNoaW50LWxvYWRlciEuL2NoZWNrZXJzLmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiYXBpQ2hlY2suanMifQ==