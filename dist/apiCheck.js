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
	var getErrorMessage = _require.getErrorMessage;
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
	  if (!args) {
	    throw new Error("apiCheck failed: Must pass arguments to check");
	  }
	  args = Array.prototype.slice.call(args);
	  if (disabled) {
	    success = true;
	  } else if (checkers.array(api) && args) {
	    success = checkMultiArgApi(api, args);
	  } else if (checkers.func(api)) {
	    success = api(args[0]);
	  } else {
	    throw new Error("apiCheck failed: Must pass an array or a function");
	  }
	  return success ? null : getFailedMessage(api, args, output);
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
	
	
	function getApiCheck(shouldThrow) {
	  return function apiCheckWrapper(api, args, output) {
	    var message = apiCheck(api, args, output);
	    args = Array.prototype.slice.call(args);
	
	    if (shouldThrow && message) {
	      throw new Error(message);
	    } else if (message) {
	      console.warn(message);
	    }
	  };
	}
	
	function getFailedMessage(api, args) {
	  var output = arguments[2] === undefined ? {} : arguments[2];
	  /* jshint maxcomplexity:7 */
	  var gOut = module.exports.config.output || {};
	  var prefix = ("" + (gOut.prefix || "") + " " + (output.prefix || "")).trim();
	  var suffix = ("" + (output.suffix || "") + " " + (gOut.suffix || "")).trim();
	  var url = gOut.docsBaseUrl && output.url && ("" + gOut.docsBaseUrl + "" + output.url).trim();
	  return ("" + prefix + " " + getErrorMessage(api, args) + " " + suffix + " " + url).trim();
	}

/***/ },
/* 2 */
/*!*************************!*\
  !*** ./apiCheckUtil.js ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = { each: each, copy: copy, typeOf: typeOf, getErrorMessage: getErrorMessage, getCheckerDisplay: getCheckerDisplay };
	
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
	
	function getErrorMessage(api, args) {
	  api = arrayify(api);
	  args = arrayify(args);
	  var apiTypes = api.map(function (checker) {
	    return getCheckerDisplay(checker) + (checker.isOptional ? " (optional)" : "");
	  }).join(", ");
	  var passedTypes = args.length ? args.map(typeOf).join(", ") : "nothing";
	  return "apiCheck failed! You passed: `" + passedTypes + "` and should have passed: `" + apiTypes + "`";
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
	      });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA0YjkyYzk1M2I5MzVhYTQ1NmU1ZiIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9hcGlDaGVjay5qcyIsIndlYnBhY2s6Ly8vLi9hcGlDaGVja1V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vY2hlY2tlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7OztBQ3RDQSxPQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFPLENBQUMsbUJBQVksQ0FBQyxDOzs7Ozs7Ozs7OztnQkNBUixtQkFBTyxDQUFDLHVCQUFnQixDQUFDOztLQUFsRCxJQUFJLFlBQUosSUFBSTtLQUFFLGVBQWUsWUFBZixlQUFlO0FBQzFCLEtBQUksUUFBUSxHQUFHLG1CQUFPLENBQUMsbUJBQVksQ0FBQyxDQUFDO0FBQ3JDLEtBQUksUUFBUSxHQUFHLEtBQUssQ0FBQzs7QUFFckIsT0FBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7O0FBRTFCLEtBQUksb0JBQW9CLEdBQUc7QUFDekIsWUFBTyxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQ3hCLE9BQUksRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDO0FBQ3hCLFVBQU8sRUFBRTtZQUFNLFFBQVEsR0FBRyxJQUFJO0lBQUE7QUFDOUIsU0FBTSxFQUFFO1lBQU0sUUFBUSxHQUFH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Q0FBQztJQUNiOztBQUVELGFBQVUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLGVBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6QixVQUFPLFVBQVUsQ0FBQztFQUNuQjs7QUFFRCxVQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDN0IsVUFBTyxDQUFDLFFBQVEsR0FBRyxTQUFTLGFBQWEsR0FBRztBQUMxQyxZQUFPLE9BQU8sa0JBQUksU0FBUyxDQUFDLENBQUM7SUFDOUIsQ0FBQztBQUNGLFVBQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUNuQyxVQUFPLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3JDLFVBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImFwaUNoZWNrXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImFwaUNoZWNrXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uXG4gKiovIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgNGI5MmM5NTNiOTM1YWE0NTZlNWZcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vYXBpQ2hlY2snKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vanNoaW50LWxvYWRlciEuL2luZGV4LmpzXG4gKiovIiwidmFyIHtlYWNoLCBnZXRFcnJvck1lc3NhZ2V9ID0gcmVxdWlyZSgnLi9hcGlDaGVja1V0aWwnKTtcbnZhciBjaGVja2VycyA9IHJlcXVpcmUoJy4vY2hlY2tlcnMnKTtcbnZhciBkaXNhYmxlZCA9IGZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwaUNoZWNrO1xuXG52YXIgYWRkaXRpb25hbFByb3BlcnRpZXMgPSB7XG4gIHRocm93OiBnZXRBcGlDaGVjayh0cnVlKSxcbiAgd2FybjogZ2V0QXBpQ2hlY2soZmFsc2UpLFxuICBkaXNhYmxlOiAoKSA9PiBkaXNhYmxlZCA9IHRydWUsXG4gIGVuYWJsZTogKCkgPT4gZGlzYWJsZWQgPSBmYWxzZSxcbiAgY29uZmlnOiB7XG4gICAgb3V0cHV0OiB7XG4gICAgICBwcmVmaXg6ICcnLFxuICAgICAgc3VmZml4OiAnJyxcbiAgICAgIGRvY3NCYXNlVXJsOiAnJ1xuICAgIH1cbiAgfVxufTtcblxuZWFjaChhZGRpdGlvbmFsUHJvcGVydGllcywgKHdyYXBwZXIsIG5hbWUpID0+IG1vZHVsZS5leHBvcnRzW25hbWVdID0gd3JhcHBlcik7XG5lYWNoKGNoZWNrZXJzLCAoY2hlY2tlciwgbmFtZSkgPT4gbW9kdWxlLmV4cG9ydHNbbmFtZV0gPSBjaGVja2VyKTtcblxuXG5cbmZ1bmN0aW9uIGFwaUNoZWNrKGFwaSwgYXJncywgb3V0cHV0KSB7XG4gIC8qIGpzaGludCBtYXhjb21wbGV4aXR5OjYgKi9cbiAgdmFyIHN1Y2Nlc3M7XG4gIGlmICghYXJncykge1xuICAgIHRocm93IG5ldyBFcnJvcignYXBpQ2hlY2sgZmFpbGVkOiBNdXN0IHBhc3MgYXJndW1lbnRzIHRvIGNoZWNrJyk7XG4gIH1cbiAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpO1xuICBpZiAoZGlzYWJsZWQpIHtcbiAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChjaGVja2Vycy5hcnJheShhcGkpICYmIGFyZ3MpIHtcbiAgICBzdWNjZXNzID0gY2hlY2tNdWx0aUFyZ0FwaShhcGksIGFyZ3MpO1xuICB9IGVsc2UgaWYgKGNoZWNrZXJzLmZ1bmMoYXBpKSkge1xuICAgIHN1Y2Nlc3MgPSBhcGkoYXJnc1swXSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhcGlDaGVjayBmYWlsZWQ6IE11c3QgcGFzcyBhbiBhcnJheSBvciBhIGZ1bmN0aW9uJyk7XG4gIH1cbiAgcmV0dXJuIHN1Y2Nlc3MgPyBudWxsIDogZ2V0RmFpbGVkTWVzc2FnZShhcGksIGFyZ3MsIG91dHB1dCk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrTXVsdGlBcmdBcGkoYXBpLCBhcmdzKSB7XG4gIHZhciBzdWNjZXNzID0gdHJ1ZTtcbiAgdmFyIGNoZWNrZXJJbmRleCA9IDA7XG4gIHZhciBhcmdJbmRleCA9IDA7XG4gIHZhciBhcmcsIGNoZWNrZXIsIHJlcztcbiAgLyoganNoaW50IC1XMDg0ICovXG4gIHdoaWxlKGFyZyA9IGFyZ3NbYXJnSW5kZXgrK10pIHtcbiAgICBjaGVja2VyID0gYXBpW2NoZWNrZXJJbmRleCsrXTtcbiAgICByZXMgPSBjaGVja2VyKGFyZyk7XG4gICAgaWYgKCFyZXMgJiYgIWNoZWNrZXIuaXNPcHRpb25hbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoIXJlcykge1xuICAgICAgYXJnSW5kZXgtLTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cblxuZnVuY3Rpb24gZ2V0QXBpQ2hlY2soc2hvdWxkVGhyb3cpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGFwaUNoZWNrV3JhcHBlcihhcGksIGFyZ3MsIG91dHB1dCkge1xuICAgIHZhciBtZXNzYWdlID0gYXBpQ2hlY2soYXBpLCBhcmdzLCBvdXRwdXQpO1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKTtcblxuICAgIGlmIChzaG91bGRUaHJvdyAmJiBtZXNzYWdlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlKSB7XG4gICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRGYWlsZWRNZXNzYWdlKGFwaSwgYXJncywgb3V0cHV0ID0ge30pIHtcbiAgLyoganNoaW50IG1heGNvbXBsZXhpdHk6NyAqL1xuICB2YXIgZ091dCA9IG1vZHVsZS5leHBvcnRzLmNvbmZpZy5vdXRwdXQgfHwge307XG4gIHZhciBwcmVmaXggPSBgJHtnT3V0LnByZWZpeCB8fCAnJ30gJHtvdXRwdXQucHJlZml4IHx8ICcnfWAudHJpbSgpO1xuICB2YXIgc3VmZml4ID0gYCR7b3V0cHV0LnN1ZmZpeCB8fCAnJ30gJHtnT3V0LnN1ZmZpeCB8fCAnJ31gLnRyaW0oKTtcbiAgdmFyIHVybCA9IGdPdXQuZG9jc0Jhc2VVcmwgJiYgb3V0cHV0LnVybCAmJiBgJHtnT3V0LmRvY3NCYXNlVXJsfSR7b3V0cHV0LnVybH1gLnRyaW0oKTtcbiAgcmV0dXJuIGAke3ByZWZpeH0gJHtnZXRFcnJvck1lc3NhZ2UoYXBpLCBhcmdzKX0gJHtzdWZmaXh9ICR7dXJsfWAudHJpbSgpO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9qc2hpbnQtbG9hZGVyIS4vYXBpQ2hlY2suanNcbiAqKi8iLCJcblxubW9kdWxlLmV4cG9ydHMgPSB7ZWFjaCwgY29weSwgdHlwZU9mLCBnZXRFcnJvck1lc3NhZ2UsIGdldENoZWNrZXJEaXNwbGF5fTtcblxuZnVuY3Rpb24gY29weShvYmopIHtcbiAgdmFyIGRhQ29weSA9IEFycmF5LmlzQXJyYXkob2JqKSA/IFtdIDoge307XG4gIGVhY2gob2JqLCAodmFsLCBrZXkpID0+IGRhQ29weVtrZXldID0gdmFsKTtcbiAgcmV0dXJuIGRhQ29weTtcbn1cblxuXG5mdW5jdGlvbiB0eXBlT2Yob2JqKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gJ2FycmF5JztcbiAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICByZXR1cm4gJ29iamVjdCc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RXJyb3JNZXNzYWdlKGFwaSwgYXJncykge1xuICBhcGkgPSBhcnJheWlmeShhcGkpO1xuICBhcmdzID0gYXJyYXlpZnkoYXJncyk7XG4gIHZhciBhcGlUeXBlcyA9IGFwaS5tYXAoY2hlY2tlciA9PiB7XG4gICAgcmV0dXJuIGdldENoZWNrZXJEaXNwbGF5KGNoZWNrZXIpICsgKGNoZWNrZXIuaXNPcHRpb25hbCA/ICcgKG9wdGlvbmFsKScgOiAnJyk7XG4gIH0pLmpvaW4oJywgJyk7XG4gIHZhciBwYXNzZWRUeXBlcyA9IGFyZ3MubGVuZ3RoID8gYXJncy5tYXAodHlwZU9mKS5qb2luKCcsICcpIDogJ25vdGhpbmcnO1xuICByZXR1cm4gJ2FwaUNoZWNrIGZhaWxlZCEgWW91IHBhc3NlZDogYCcgKyBwYXNzZWRUeXBlcyArICdgIGFuZCBzaG91bGQgaGF2ZSBwYXNzZWQ6IGAnICsgYXBpVHlwZXMgKyAnYCc7XG59XG5cbmZ1bmN0aW9uIGdldENoZWNrZXJEaXNwbGF5KGNoZWNrZXIpIHtcbiAgcmV0dXJuIGNoZWNrZXIudHlwZSB8fCBjaGVja2VyLmRpc3BsYXlOYW1lIHx8IGNoZWNrZXIubmFtZTtcbn1cblxuZnVuY3Rpb24gYXJyYXlpZnkob2JqKSB7XG4gIGlmICghb2JqKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtvYmpdO1xuICB9XG59XG5cblxuZnVuY3Rpb24gZWFjaChvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gZWFjaEFycnkoLi4uYXJndW1lbnRzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZWFjaE9iaiguLi5hcmd1bWVudHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVhY2hPYmoob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICB2YXIgcmV0O1xuICB2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChoYXNPd24uY2FsbChvYmosIGtleSkpIHtcbiAgICAgIHJldCA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBlYWNoQXJyeShvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gIHZhciByZXQ7XG4gIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgcmV0ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaik7XG4gICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9qc2hpbnQtbG9hZGVyIS4vYXBpQ2hlY2tVdGlsLmpzXG4gKiovIiwidmFyIHt0eXBlT2YsIGVhY2gsIGNvcHksIGdldENoZWNrZXJEaXNwbGF5fSA9IHJlcXVpcmUoJy4vYXBpQ2hlY2tVdGlsJyk7XG52YXIgY2hlY2tlcnMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXJyYXk6IGdldFR5cGVPZkNoZWNrZXIoJ2FycmF5JyksXG4gIGJvb2w6IGdldFR5cGVPZkNoZWNrZXIoJ2Jvb2xlYW4nKSxcbiAgZnVuYzogZ2V0VHlwZU9mQ2hlY2tlcignZnVuY3Rpb24nKSxcbiAgbnVtYmVyOiBnZXRUeXBlT2ZDaGVja2VyKCdudW1iZXInKSxcbiAgc3RyaW5nOiBnZXRUeXBlT2ZDaGVja2VyKCdzdHJpbmcnKSxcbiAgb2JqZWN0OiBnZXRPYmplY3RDaGVja2VyKCksXG5cbiAgaW5zdGFuY2VPZjogaW5zdGFuY2VDaGVja0dldHRlcixcbiAgb25lT2Y6IG9uZU9mQ2hlY2tHZXR0ZXIsXG4gIG9uZU9mVHlwZTogb25lT2ZUeXBlQ2hlY2tHZXR0ZXIsXG5cbiAgYXJyYXlPZjogYXJyYXlPZkNoZWNrR2V0dGVyLFxuICBvYmplY3RPZjogb2JqZWN0T2ZDaGVja0dldHRlcixcblxuICBzaGFwZTogZ2V0U2hhcGVDaGVja0dldHRlcigpLFxuXG4gIGFueTogYW55Q2hlY2tHZXR0ZXIoKVxufTtcblxuZWFjaChjaGVja2VycywgY2hlY2tlciA9PiB7XG4gIGNoZWNrZXIuZGlzcGxheU5hbWUgPSBgYXBpQ2hlY2sgXFxgJHtjaGVja2VyLnR5cGV9XFxgIHR5cGUgY2hlY2tlcmA7XG59KTtcblxuXG5mdW5jdGlvbiBnZXRUeXBlT2ZDaGVja2VyKHR5cGUpIHtcbiAgZnVuY3Rpb24gdHlwZU9mQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdHlwZU9mKHZhbCkgPT09IHR5cGU7XG4gIH1cblxuICB0eXBlT2ZDaGVja2VyLnR5cGUgPSB0eXBlO1xuICBtYWtlT3B0aW9uYWwodHlwZU9mQ2hlY2tlcik7XG4gIHJldHVybiB0eXBlT2ZDaGVja2VyO1xufVxuXG5mdW5jdGlvbiBnZXRPYmplY3RDaGVja2VyKCkge1xuICBmdW5jdGlvbiBvYmplY3ROdWxsT2tDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB0eXBlT2YodmFsKSA9PT0gJ29iamVjdCc7XG4gIH1cbiAgb2JqZWN0TnVsbE9rQ2hlY2tlci50eXBlID0gJ29iamVjdFtudWxsIG9rXSc7XG4gIG1ha2VPcHRpb25hbChvYmplY3ROdWxsT2tDaGVja2VyKTtcbiAgZnVuY3Rpb24gb2JqZWN0Q2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsICE9PSBudWxsICYmIG9iamVjdE51bGxPa0NoZWNrZXIodmFsKTtcbiAgfVxuICBvYmplY3RDaGVja2VyLnR5cGUgPSAnb2JqZWN0JztcbiAgbWFrZU9wdGlvbmFsKG9iamVjdENoZWNrZXIpO1xuICBvYmplY3RDaGVja2VyLm51bGxPayA9IG9iamVjdE51bGxPa0NoZWNrZXI7XG5cbiAgcmV0dXJuIG9iamVjdENoZWNrZXI7XG59XG5cblxuZnVuY3Rpb24gaW5zdGFuY2VDaGVja0dldHRlcihjbGFzc1RvQ2hlY2spIHtcbiAgZnVuY3Rpb24gaW5zdGFuY2VDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB2YWwgaW5zdGFuY2VvZiBjbGFzc1RvQ2hlY2s7XG4gIH1cblxuICBpbnN0YW5jZUNoZWNrZXIudHlwZSA9IGNsYXNzVG9DaGVjay5uYW1lO1xuICBtYWtlT3B0aW9uYWwoaW5zdGFuY2VDaGVja2VyKTtcbiAgcmV0dXJuIGluc3RhbmNlQ2hlY2tlcjtcbn1cblxuZnVuY3Rpb24gb25lT2ZDaGVja0dldHRlcihpdGVtcykge1xuICBmdW5jdGlvbiBvbmVPZkNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGl0ZW1zLnNvbWUoaXRlbSA9PiBpdGVtID09PSB2YWwpO1xuICB9XG5cbiAgb25lT2ZDaGVja2VyLnR5cGUgPSBgZW51bVske2l0ZW1zLmpvaW4oJywgJyl9XWA7XG4gIG1ha2VPcHRpb25hbChvbmVPZkNoZWNrZXIpO1xuICByZXR1cm4gb25lT2ZDaGVja2VyO1xufVxuXG5mdW5jdGlvbiBvbmVPZlR5cGVDaGVja0dldHRlcihjaGVja2Vycykge1xuICBmdW5jdGlvbiBvbmVPZlR5cGVDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiBjaGVja2Vycy5zb21lKGl0ZW0gPT4gaXRlbSh2YWwpKTtcbiAgfVxuXG4gIG9uZU9mVHlwZUNoZWNrZXIudHlwZSA9IGNoZWNrZXJzLm1hcChnZXRDaGVja2VyRGlzcGxheSkuam9pbignIG9yICcpO1xuICBtYWtlT3B0aW9uYWwob25lT2ZUeXBlQ2hlY2tlcik7XG4gIHJldHVybiBvbmVPZlR5cGVDaGVja2VyO1xufVxuXG5mdW5jdGlvbiBhcnJheU9mQ2hlY2tHZXR0ZXIoY2hlY2tlcikge1xuICBmdW5jdGlvbiBhcnJheU9mQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gY2hlY2tlcnMuYXJyYXkodmFsKSAmJiB2YWwuZXZlcnkoY2hlY2tlcik7XG4gIH1cblxuICBhcnJheU9mQ2hlY2tlci50eXBlID0gYGFycmF5T2ZbJHtnZXRDaGVja2VyRGlzcGxheShjaGVja2VyKX1dYDtcbiAgbWFrZU9wdGlvbmFsKGFycmF5T2ZDaGVja2VyKTtcbiAgcmV0dXJuIGFycmF5T2ZDaGVja2VyO1xufVxuXG5mdW5jdGlvbiBvYmplY3RPZkNoZWNrR2V0dGVyKGNoZWNrZXIpIHtcbiAgZnVuY3Rpb24gb2JqZWN0T2ZDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiBjaGVja2Vycy5vYmplY3QodmFsKSAmJiBlYWNoKHZhbCwgY2hlY2tlcik7XG4gIH1cblxuICBvYmplY3RPZkNoZWNrZXIudHlwZSA9IGBvYmplY3RPZlske2dldENoZWNrZXJEaXNwbGF5KGNoZWNrZXIpfV1gO1xuICBtYWtlT3B0aW9uYWwob2JqZWN0T2ZDaGVja2VyKTtcbiAgcmV0dXJuIG9iamVjdE9mQ2hlY2tlcjtcbn1cblxuZnVuY3Rpb24gZ2V0U2hhcGVDaGVja0dldHRlcigpIHtcbiAgZnVuY3Rpb24gc2hhcGVDaGVja0dldHRlcihzaGFwZSkge1xuICAgIGZ1bmN0aW9uIHNoYXBlQ2hlY2tlcih2YWwpIHtcbiAgICAgIHJldHVybiBjaGVja2Vycy5vYmplY3QodmFsKSAmJiBlYWNoKHNoYXBlLCAoY2hlY2tlciwgcHJvcCkgPT4ge1xuICAgICAgICAgIGlmICghdmFsLmhhc093blByb3BlcnR5KHByb3ApICYmIGNoZWNrZXIuaXNPcHRpb25hbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjaGVja2VyKHZhbFtwcm9wXSwgcHJvcCwgdmFsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBjb3BpZWRTaGFwZSA9IGNvcHkoc2hhcGUpO1xuICAgIGVhY2goY29waWVkU2hhcGUsICh2YWwsIHByb3ApID0+IHtcbiAgICAgIGNvcGllZFNoYXBlW3Byb3BdID0gZ2V0Q2hlY2tlckRpc3BsYXkodmFsKTtcbiAgICB9KTtcbiAgICBzaGFwZUNoZWNrZXIudHlwZSA9IGBzaGFwZSgke0pTT04uc3RyaW5naWZ5KGNvcGllZFNoYXBlKX0pYDtcbiAgICBtYWtlT3B0aW9uYWwoc2hhcGVDaGVja2VyKTtcbiAgICByZXR1cm4gc2hhcGVDaGVja2VyO1xuICB9XG5cbiAgc2hhcGVDaGVja0dldHRlci5pZk5vdCA9IGZ1bmN0aW9uIGlmTm90KG90aGVyUHJvcHMsIHByb3BDaGVja2VyKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG90aGVyUHJvcHMpKSB7XG4gICAgICBvdGhlclByb3BzID0gW290aGVyUHJvcHNdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpZk5vdENoZWNrZXIocHJvcCwgcHJvcE5hbWUsIG9iaikge1xuICAgICAgcmV0dXJuICFvdGhlclByb3BzLnNvbWUocHJvcCA9PiBvYmouaGFzT3duUHJvcGVydHkocHJvcCkpICYmIHByb3BDaGVja2VyKHByb3ApO1xuICAgIH1cbiAgICBpZk5vdENoZWNrZXIudHlwZSA9IGBpZk5vdFske290aGVyUHJvcHMuam9pbignLCAnKX1dYDtcbiAgICBtYWtlT3B0aW9uYWwoaWZOb3RDaGVja2VyKTtcbiAgICByZXR1cm4gaWZOb3RDaGVja2VyO1xuICB9O1xuXG4gIHNoYXBlQ2hlY2tHZXR0ZXIub25seUlmID0gZnVuY3Rpb24gb25seUlmKG90aGVyUHJvcHMsIHByb3BDaGVja2VyKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG90aGVyUHJvcHMpKSB7XG4gICAgICBvdGhlclByb3BzID0gW290aGVyUHJvcHNdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBvbmx5SWZDaGVja2VyKHByb3AsIHByb3BOYW1lLCBvYmopIHtcbiAgICAgIHJldHVybiBvdGhlclByb3BzLmV2ZXJ5KHByb3AgPT4gb2JqLmhhc093blByb3BlcnR5KHByb3ApKSAmJiBwcm9wQ2hlY2tlcihwcm9wKTtcbiAgICB9XG4gICAgb25seUlmQ2hlY2tlci50eXBlID0gYG9ubHlJZlske290aGVyUHJvcHMuam9pbignLCAnKX1dYDtcbiAgICBtYWtlT3B0aW9uYWwob25seUlmQ2hlY2tlcik7XG4gICAgcmV0dXJuIG9ubHlJZkNoZWNrZXI7XG4gIH07XG5cbiAgcmV0dXJuIHNoYXBlQ2hlY2tHZXR0ZXI7XG59XG5cbmZ1bmN0aW9uIGFueUNoZWNrR2V0dGVyKCkge1xuICBmdW5jdGlvbiBhbnlDaGVja2VyKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYW55Q2hlY2tlci50eXBlID0gJ2FueSc7XG4gIG1ha2VPcHRpb25hbChhbnlDaGVja2VyKTtcbiAgcmV0dXJuIGFueUNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG1ha2VPcHRpb25hbChjaGVja2VyKSB7XG4gIGNoZWNrZXIub3B0aW9uYWwgPSBmdW5jdGlvbiBvcHRpb25hbENoZWNrKCkge1xuICAgIHJldHVybiBjaGVja2VyKC4uLmFyZ3VtZW50cyk7XG4gIH07XG4gIGNoZWNrZXIub3B0aW9uYWwuaXNPcHRpb25hbCA9IHRydWU7XG4gIGNoZWNrZXIub3B0aW9uYWwudHlwZSA9IGNoZWNrZXIudHlwZTtcbiAgY2hlY2tlci5vcHRpb25hbC5kaXNwbGF5TmFtZSA9IGNoZWNrZXIuZGlzcGxheU5hbWU7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuLi9+L2pzaGludC1sb2FkZXIhLi9jaGVja2Vycy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImFwaUNoZWNrLmpzIn0=