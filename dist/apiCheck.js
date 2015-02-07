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
	
	var _toArray = function (arr) { return Array.isArray(arr) ? arr : Array.from(arr); };
	
	var _require = __webpack_require__(/*! ./apiCheckUtil */ 2);
	
	var each = _require.each;
	var getErrorMessage = _require.getErrorMessage;
	var checkers = __webpack_require__(/*! ./checkers */ 3);
	var disabled = false;
	
	module.exports = apiCheck;
	
	var additionalFns = {
	  "throw": getApiCheck(true),
	  warn: getApiCheck(false),
	  disable: function () {
	    return disabled = true;
	  },
	  enable: function () {
	    return disabled = false;
	  }
	};
	
	each(additionalFns, function (wrapper, name) {
	  return module.exports[name] = wrapper;
	});
	each(checkers, function (checker, name) {
	  return module.exports[name] = checker;
	});
	
	
	
	function apiCheck(api, args) {
	  var results = [];
	  if (!args) {
	    throw new Error("apiCheck failed: Must pass arguments to check");
	  }
	  args = [].concat(_toArray(args));
	  if (disabled) {
	    results = args.map(function () {
	      return true;
	    });
	  } else if (checkers.array(api) && args) {
	    results = checkMultiArgApi(api, args);
	  } else if (checkers.func(api)) {
	    results.push(api(args[0]));
	  } else {
	    throw new Error("apiCheck failed: Must pass an array or a function");
	  }
	  return results;
	}
	
	function checkMultiArgApi(api, args) {
	  var results = [];
	  var checkerIndex = 0;
	  var argIndex = 0;
	  var arg, checker, res;
	  /* jshint -W084 */
	  while (arg = args[argIndex++]) {
	    checker = api[checkerIndex++];
	    res = checker(arg);
	    if (!res && !checker.isOptional) {
	      results.push(false);
	    } else if (!res) {
	      argIndex--;
	    } else {
	      results.push(true);
	    }
	  }
	  return results;
	}
	
	
	function getApiCheck(shouldThrow) {
	  return function apiCheckWrapper(api, args) {
	    var result = apiCheck.apply(undefined, arguments);
	    args = [].concat(_toArray(args));
	    var failed = result.some(function (passed) {
	      return !passed;
	    });
	
	    if (shouldThrow && failed) {
	      throw new Error(getErrorMessage(api, args));
	    } else if (failed) {
	      console.warn(getErrorMessage(api, args));
	    }
	  };
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
	  object: getTypeOfChecker("object"),
	  string: getTypeOfChecker("string"),
	
	  instanceOf: instanceCheckGetter,
	  oneOf: oneOfCheckGetter,
	  oneOfType: oneOfTypeCheckGetter,
	
	  arrayOf: arrayOfCheckGetter,
	  objectOf: objectOfCheckGetter,
	
	  shape: shapeCheckGetter,
	
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
	
	function shapeCheckGetter(shape) {
	  function shapeChecker(val) {
	    return checkers.object(val) && each(shape, function (checker, prop) {
	      if (!val[prop] && checker.isOptional) {
	        return true;
	      } else {
	        return checker(val[prop]);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAwMGY2ZWI3OTY0OGQyZDIyYThhNCIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9hcGlDaGVjay5qcyIsIndlYnBhY2s6Ly8vLi9hcGlDaGVja1V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vY2hlY2tlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7OztBQ3RDQSxPQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFPLENBQUMsbUJBQVksQ0FBQyxDOzs7Ozs7Ozs7Ozs7O2dCQ0FSLG1CQUFPLENBQUMsdUJBQWdCLENBQUM7O0tBQWxELElBQUksWUFBSixJQUFJO0tBQUUsZUFBZSxZQUFmLGVBQWU7QUFDMUIsS0FBSSxRQUFRLEdBQUcsbUJBQU8sQ0FBQyxtQkFBWSxDQUFDLENBQUM7QUFDckMsS0FBSSxRQUFRLEdBQUcsS0FBSyxDQUFDOztBQUVyQixPQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7QUFFMUIsS0FBSSxhQUFhLEdBQUc7QUFDbEIsWUFBTyxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQ3hCLE9BQUksRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDO0FBQ3hCLFVBQU8sRUFBRTtZQUFNLFFBQVEsR0FBRyxJQUFJO0lBQUE7QUFDOUIsU0FBTSxFQUFFO1lBQU0sUUFBUSxHQUFH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QUFPLE9BQU8sa0JBQUksU0FBUyxDQUFDLENBQUM7SUFDOUIsQ0FBQztBQUNGLFVBQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUNuQyxVQUFPLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3JDLFVBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImFwaUNoZWNrXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImFwaUNoZWNrXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uXG4gKiovIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgMDBmNmViNzk2NDhkMmQyMmE4YTRcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vYXBpQ2hlY2snKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vanNoaW50LWxvYWRlciEuL2luZGV4LmpzXG4gKiovIiwidmFyIHtlYWNoLCBnZXRFcnJvck1lc3NhZ2V9ID0gcmVxdWlyZSgnLi9hcGlDaGVja1V0aWwnKTtcbnZhciBjaGVja2VycyA9IHJlcXVpcmUoJy4vY2hlY2tlcnMnKTtcbnZhciBkaXNhYmxlZCA9IGZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwaUNoZWNrO1xuXG52YXIgYWRkaXRpb25hbEZucyA9IHtcbiAgdGhyb3c6IGdldEFwaUNoZWNrKHRydWUpLFxuICB3YXJuOiBnZXRBcGlDaGVjayhmYWxzZSksXG4gIGRpc2FibGU6ICgpID0+IGRpc2FibGVkID0gdHJ1ZSxcbiAgZW5hYmxlOiAoKSA9PiBkaXNhYmxlZCA9IGZhbHNlXG59O1xuXG5lYWNoKGFkZGl0aW9uYWxGbnMsICh3cmFwcGVyLCBuYW1lKSA9PiBtb2R1bGUuZXhwb3J0c1tuYW1lXSA9IHdyYXBwZXIpO1xuZWFjaChjaGVja2VycywgKGNoZWNrZXIsIG5hbWUpID0+IG1vZHVsZS5leHBvcnRzW25hbWVdID0gY2hlY2tlcik7XG5cblxuXG5mdW5jdGlvbiBhcGlDaGVjayhhcGksIGFyZ3MpIHtcbiAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgaWYgKCFhcmdzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhcGlDaGVjayBmYWlsZWQ6IE11c3QgcGFzcyBhcmd1bWVudHMgdG8gY2hlY2snKTtcbiAgfVxuICBhcmdzID0gWy4uLmFyZ3NdO1xuICBpZiAoZGlzYWJsZWQpIHtcbiAgICByZXN1bHRzID0gYXJncy5tYXAoKCkgPT4gdHJ1ZSk7XG4gIH0gZWxzZSBpZiAoY2hlY2tlcnMuYXJyYXkoYXBpKSAmJiBhcmdzKSB7XG4gICAgcmVzdWx0cyA9IGNoZWNrTXVsdGlBcmdBcGkoYXBpLCBhcmdzKTtcbiAgfSBlbHNlIGlmIChjaGVja2Vycy5mdW5jKGFwaSkpIHtcbiAgICByZXN1bHRzLnB1c2goYXBpKGFyZ3NbMF0pKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FwaUNoZWNrIGZhaWxlZDogTXVzdCBwYXNzIGFuIGFycmF5IG9yIGEgZnVuY3Rpb24nKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuZnVuY3Rpb24gY2hlY2tNdWx0aUFyZ0FwaShhcGksIGFyZ3MpIHtcbiAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgdmFyIGNoZWNrZXJJbmRleCA9IDA7XG4gIHZhciBhcmdJbmRleCA9IDA7XG4gIHZhciBhcmcsIGNoZWNrZXIsIHJlcztcbiAgLyoganNoaW50IC1XMDg0ICovXG4gIHdoaWxlKGFyZyA9IGFyZ3NbYXJnSW5kZXgrK10pIHtcbiAgICBjaGVja2VyID0gYXBpW2NoZWNrZXJJbmRleCsrXTtcbiAgICByZXMgPSBjaGVja2VyKGFyZyk7XG4gICAgaWYgKCFyZXMgJiYgIWNoZWNrZXIuaXNPcHRpb25hbCkge1xuICAgICAgcmVzdWx0cy5wdXNoKGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKCFyZXMpIHtcbiAgICAgIGFyZ0luZGV4LS07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0cnVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cblxuZnVuY3Rpb24gZ2V0QXBpQ2hlY2soc2hvdWxkVGhyb3cpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGFwaUNoZWNrV3JhcHBlcihhcGksIGFyZ3MpIHtcbiAgICB2YXIgcmVzdWx0ID0gYXBpQ2hlY2soLi4uYXJndW1lbnRzKTtcbiAgICBhcmdzID0gWy4uLmFyZ3NdO1xuICAgIHZhciBmYWlsZWQgPSByZXN1bHQuc29tZShwYXNzZWQgPT4gIXBhc3NlZCk7XG5cbiAgICBpZiAoc2hvdWxkVGhyb3cgJiYgZmFpbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZ2V0RXJyb3JNZXNzYWdlKGFwaSwgYXJncykpO1xuICAgIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgICBjb25zb2xlLndhcm4oZ2V0RXJyb3JNZXNzYWdlKGFwaSwgYXJncykpO1xuICAgIH1cbiAgfTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vanNoaW50LWxvYWRlciEuL2FwaUNoZWNrLmpzXG4gKiovIiwiXG5cbm1vZHVsZS5leHBvcnRzID0ge2VhY2gsIGNvcHksIHR5cGVPZiwgZ2V0RXJyb3JNZXNzYWdlLCBnZXRDaGVja2VyRGlzcGxheX07XG5cbmZ1bmN0aW9uIGNvcHkob2JqKSB7XG4gIHZhciBkYUNvcHkgPSBBcnJheS5pc0FycmF5KG9iaikgPyBbXSA6IHt9O1xuICBlYWNoKG9iaiwgKHZhbCwga2V5KSA9PiBkYUNvcHlba2V5XSA9IHZhbCk7XG4gIHJldHVybiBkYUNvcHk7XG59XG5cblxuZnVuY3Rpb24gdHlwZU9mKG9iaikge1xuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuICdhcnJheSc7XG4gIH0gZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgcmV0dXJuICdvYmplY3QnO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEVycm9yTWVzc2FnZShhcGksIGFyZ3MpIHtcbiAgYXBpID0gYXJyYXlpZnkoYXBpKTtcbiAgYXJncyA9IGFycmF5aWZ5KGFyZ3MpO1xuICB2YXIgYXBpVHlwZXMgPSBhcGkubWFwKGNoZWNrZXIgPT4ge1xuICAgIHJldHVybiBnZXRDaGVja2VyRGlzcGxheShjaGVja2VyKSArIChjaGVja2VyLmlzT3B0aW9uYWwgPyAnIChvcHRpb25hbCknIDogJycpO1xuICB9KS5qb2luKCcsICcpO1xuICB2YXIgcGFzc2VkVHlwZXMgPSBhcmdzLmxlbmd0aCA/IGFyZ3MubWFwKHR5cGVPZikuam9pbignLCAnKSA6ICdub3RoaW5nJztcbiAgcmV0dXJuICdhcGlDaGVjayBmYWlsZWQhIFlvdSBwYXNzZWQ6IGAnICsgcGFzc2VkVHlwZXMgKyAnYCBhbmQgc2hvdWxkIGhhdmUgcGFzc2VkOiBgJyArIGFwaVR5cGVzICsgJ2AnO1xufVxuXG5mdW5jdGlvbiBnZXRDaGVja2VyRGlzcGxheShjaGVja2VyKSB7XG4gIHJldHVybiBjaGVja2VyLnR5cGUgfHwgY2hlY2tlci5kaXNwbGF5TmFtZSB8fCBjaGVja2VyLm5hbWU7XG59XG5cbmZ1bmN0aW9uIGFycmF5aWZ5KG9iaikge1xuICBpZiAoIW9iaikge1xuICAgIHJldHVybiBbXTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbb2JqXTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGVhY2gob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIGVhY2hBcnJ5KC4uLmFyZ3VtZW50cyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGVhY2hPYmooLi4uYXJndW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlYWNoT2JqKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgdmFyIHJldDtcbiAgdmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICByZXQgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZWFjaEFycnkob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICB2YXIgcmV0O1xuICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHJldCA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vanNoaW50LWxvYWRlciEuL2FwaUNoZWNrVXRpbC5qc1xuICoqLyIsInZhciB7dHlwZU9mLCBlYWNoLCBjb3B5LCBnZXRDaGVja2VyRGlzcGxheX0gPSByZXF1aXJlKCcuL2FwaUNoZWNrVXRpbCcpO1xudmFyIGNoZWNrZXJzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFycmF5OiBnZXRUeXBlT2ZDaGVja2VyKCdhcnJheScpLFxuICBib29sOiBnZXRUeXBlT2ZDaGVja2VyKCdib29sZWFuJyksXG4gIGZ1bmM6IGdldFR5cGVPZkNoZWNrZXIoJ2Z1bmN0aW9uJyksXG4gIG51bWJlcjogZ2V0VHlwZU9mQ2hlY2tlcignbnVtYmVyJyksXG4gIG9iamVjdDogZ2V0VHlwZU9mQ2hlY2tlcignb2JqZWN0JyksXG4gIHN0cmluZzogZ2V0VHlwZU9mQ2hlY2tlcignc3RyaW5nJyksXG5cbiAgaW5zdGFuY2VPZjogaW5zdGFuY2VDaGVja0dldHRlcixcbiAgb25lT2Y6IG9uZU9mQ2hlY2tHZXR0ZXIsXG4gIG9uZU9mVHlwZTogb25lT2ZUeXBlQ2hlY2tHZXR0ZXIsXG5cbiAgYXJyYXlPZjogYXJyYXlPZkNoZWNrR2V0dGVyLFxuICBvYmplY3RPZjogb2JqZWN0T2ZDaGVja0dldHRlcixcblxuICBzaGFwZTogc2hhcGVDaGVja0dldHRlcixcblxuICBhbnk6IGFueUNoZWNrR2V0dGVyKClcbn07XG5cbmVhY2goY2hlY2tlcnMsIGNoZWNrZXIgPT4ge1xuICBjaGVja2VyLmRpc3BsYXlOYW1lID0gYGFwaUNoZWNrIFxcYCR7Y2hlY2tlci50eXBlfVxcYCB0eXBlIGNoZWNrZXJgO1xufSk7XG5cblxuZnVuY3Rpb24gZ2V0VHlwZU9mQ2hlY2tlcih0eXBlKSB7XG4gIGZ1bmN0aW9uIHR5cGVPZkNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHR5cGVPZih2YWwpID09PSB0eXBlO1xuICB9XG5cbiAgdHlwZU9mQ2hlY2tlci50eXBlID0gdHlwZTtcbiAgbWFrZU9wdGlvbmFsKHR5cGVPZkNoZWNrZXIpO1xuICByZXR1cm4gdHlwZU9mQ2hlY2tlcjtcbn1cblxuXG5mdW5jdGlvbiBpbnN0YW5jZUNoZWNrR2V0dGVyKGNsYXNzVG9DaGVjaykge1xuICBmdW5jdGlvbiBpbnN0YW5jZUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCBpbnN0YW5jZW9mIGNsYXNzVG9DaGVjaztcbiAgfVxuXG4gIGluc3RhbmNlQ2hlY2tlci50eXBlID0gY2xhc3NUb0NoZWNrLm5hbWU7XG4gIG1ha2VPcHRpb25hbChpbnN0YW5jZUNoZWNrZXIpO1xuICByZXR1cm4gaW5zdGFuY2VDaGVja2VyO1xufVxuXG5mdW5jdGlvbiBvbmVPZkNoZWNrR2V0dGVyKGl0ZW1zKSB7XG4gIGZ1bmN0aW9uIG9uZU9mQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gaXRlbXMuc29tZShpdGVtID0+IGl0ZW0gPT09IHZhbCk7XG4gIH1cblxuICBvbmVPZkNoZWNrZXIudHlwZSA9IGBlbnVtWyR7aXRlbXMuam9pbignLCAnKX1dYDtcbiAgbWFrZU9wdGlvbmFsKG9uZU9mQ2hlY2tlcik7XG4gIHJldHVybiBvbmVPZkNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG9uZU9mVHlwZUNoZWNrR2V0dGVyKGNoZWNrZXJzKSB7XG4gIGZ1bmN0aW9uIG9uZU9mVHlwZUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGNoZWNrZXJzLnNvbWUoaXRlbSA9PiBpdGVtKHZhbCkpO1xuICB9XG5cbiAgb25lT2ZUeXBlQ2hlY2tlci50eXBlID0gY2hlY2tlcnMubWFwKGdldENoZWNrZXJEaXNwbGF5KS5qb2luKCcgb3IgJyk7XG4gIG1ha2VPcHRpb25hbChvbmVPZlR5cGVDaGVja2VyKTtcbiAgcmV0dXJuIG9uZU9mVHlwZUNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIGFycmF5T2ZDaGVja0dldHRlcihjaGVja2VyKSB7XG4gIGZ1bmN0aW9uIGFycmF5T2ZDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiBjaGVja2Vycy5hcnJheSh2YWwpICYmIHZhbC5ldmVyeShjaGVja2VyKTtcbiAgfVxuXG4gIGFycmF5T2ZDaGVja2VyLnR5cGUgPSBgYXJyYXlPZlske2dldENoZWNrZXJEaXNwbGF5KGNoZWNrZXIpfV1gO1xuICBtYWtlT3B0aW9uYWwoYXJyYXlPZkNoZWNrZXIpO1xuICByZXR1cm4gYXJyYXlPZkNoZWNrZXI7XG59XG5cbmZ1bmN0aW9uIG9iamVjdE9mQ2hlY2tHZXR0ZXIoY2hlY2tlcikge1xuICBmdW5jdGlvbiBvYmplY3RPZkNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGNoZWNrZXJzLm9iamVjdCh2YWwpICYmIGVhY2godmFsLCBjaGVja2VyKTtcbiAgfVxuXG4gIG9iamVjdE9mQ2hlY2tlci50eXBlID0gYG9iamVjdE9mWyR7Z2V0Q2hlY2tlckRpc3BsYXkoY2hlY2tlcil9XWA7XG4gIG1ha2VPcHRpb25hbChvYmplY3RPZkNoZWNrZXIpO1xuICByZXR1cm4gb2JqZWN0T2ZDaGVja2VyO1xufVxuXG5mdW5jdGlvbiBzaGFwZUNoZWNrR2V0dGVyKHNoYXBlKSB7XG4gIGZ1bmN0aW9uIHNoYXBlQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gY2hlY2tlcnMub2JqZWN0KHZhbCkgJiYgZWFjaChzaGFwZSwgKGNoZWNrZXIsIHByb3ApID0+IHtcbiAgICAgICAgaWYgKCF2YWxbcHJvcF0gJiYgY2hlY2tlci5pc09wdGlvbmFsKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGNoZWNrZXIodmFsW3Byb3BdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICB2YXIgY29waWVkU2hhcGUgPSBjb3B5KHNoYXBlKTtcbiAgZWFjaChjb3BpZWRTaGFwZSwgKHZhbCwgcHJvcCkgPT4ge1xuICAgIGNvcGllZFNoYXBlW3Byb3BdID0gZ2V0Q2hlY2tlckRpc3BsYXkodmFsKTtcbiAgfSk7XG4gIHNoYXBlQ2hlY2tlci50eXBlID0gYHNoYXBlKCR7SlNPTi5zdHJpbmdpZnkoY29waWVkU2hhcGUpfSlgO1xuICBtYWtlT3B0aW9uYWwoc2hhcGVDaGVja2VyKTtcbiAgcmV0dXJuIHNoYXBlQ2hlY2tlcjtcbn1cblxuZnVuY3Rpb24gYW55Q2hlY2tHZXR0ZXIoKSB7XG4gIGZ1bmN0aW9uIGFueUNoZWNrZXIoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhbnlDaGVja2VyLnR5cGUgPSAnYW55JztcbiAgbWFrZU9wdGlvbmFsKGFueUNoZWNrZXIpO1xuICByZXR1cm4gYW55Q2hlY2tlcjtcbn1cblxuZnVuY3Rpb24gbWFrZU9wdGlvbmFsKGNoZWNrZXIpIHtcbiAgY2hlY2tlci5vcHRpb25hbCA9IGZ1bmN0aW9uIG9wdGlvbmFsQ2hlY2soKSB7XG4gICAgcmV0dXJuIGNoZWNrZXIoLi4uYXJndW1lbnRzKTtcbiAgfTtcbiAgY2hlY2tlci5vcHRpb25hbC5pc09wdGlvbmFsID0gdHJ1ZTtcbiAgY2hlY2tlci5vcHRpb25hbC50eXBlID0gY2hlY2tlci50eXBlO1xuICBjaGVja2VyLm9wdGlvbmFsLmRpc3BsYXlOYW1lID0gY2hlY2tlci5kaXNwbGF5TmFtZTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vanNoaW50LWxvYWRlciEuL2NoZWNrZXJzLmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiYXBpQ2hlY2suanMifQ==