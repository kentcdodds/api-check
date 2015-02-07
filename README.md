# apiCheck.js

[![Build Status](https://travis-ci.org/kentcdodds/apiCheck.js.svg)](https://travis-ci.org/kentcdodds/apiCheck.js)

[![Coverage Status](https://coveralls.io/repos/kentcdodds/apiCheck.js/badge.svg?branch=master)](https://coveralls.io/r/kentcdodds/apiCheck.js?branch=master)


It's like ReactJS `propTypes` without React. Actually, it's very heavily inspired by this concept. It's purpose is for
normal JavaScript functions rather than React Components.

## Example

Note, there are a bunch of tests. Those should be instructive as well.

```javascript
// given we have a function like this:
function foo(bar, foobar) {
  // we can define our api as the first argument to apiCheck.warn
  apiCheck.warn([apiCheck.number, apiCheck.arrayOf(apiCheck.string)], arguments);
  // do stuff
}
// the function above can be called like so:
foo(3, ['a','b','c']);

// if it were called like so, a descriptive warning would be logged to the console
foo('whatever', false);


// the function below can be called in the following ways:
doSomething(person, options, callback);
doSomething(person, callback);

// if it is called differently, or if the shape of person is wrong, then a descriptive error is thrown.

function doSomething(person, options, callback) {
  apiCheck.throw([
    apiCheck.shape({
      name: apiCheck.shape({
        first: apiCheck.string,
        last: apiCheck.string
      }),
      age: apiCheck.number,
      isOld: apiCheck.bool,
      walk: apiCheck.func,
      childrenNames: apiCheck.arrayOf(apiCheck.string).optional
    }),
    apiCheck.any.optional,
    apiCheck.func
  ], arguments);

  // do stuff
}

// an example object that would pass the first apiCheck.shape is here:
var obj = {
  name: {
    first: 'Matt',
    last: 'Meese'
  },
  age: 27,
  isOld: false,
  walk: () => {}
};
```

## Differences from React's propTypes

All types are required by default, to set something as optional, append `.optional`

## Similarities to React's propTypes

This project was totally written from scratch, but it (should) support the same api as React's `propTypes` (with the
noted difference above). If you notice something that functions differently, please file an issue.

## apiCheck(), apiCheck.warn(), and apiCheck.throw()

These functions do the same thing, with minor differences. In both the `warn` and `throw` case, a message is generated
based on the arguments that the function was received and the api that was defined to describe what was wrong with the
invocation.

In the case of `apiCheck()`, an array is returned. Each element in the array is a boolean corresponding to whether the
argument (at that position) was valid or not. For example:

```javascript
var result = apiCheck([apiCheck.string, apiCheck.number], [3, 4]);
console.log(result); // <-- logs [false, true]
```

Also note that if you only have one argument, then the first argument to the `apiCheck` function can simply be the
checker function. For example:

```javascript
apiCheck(apiCheck.bool, [false]);
```

(Note, the primary use case for `apiCheck` is for checking arguments, hence the second argument should always be an
array-like thing (like `arguments`).

## Disable apiCheck

It's a good idea to disable the apiCheck in production. To do this, simply invoke `disable()`

```javascript
apiCheck.disable();

// to re-enable it
apiCheck.enable();
```
