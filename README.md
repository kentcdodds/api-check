# apiCheck.js

[![Build Status](https://travis-ci.org/kentcdodds/apiCheck.js.svg)](https://travis-ci.org/kentcdodds/apiCheck.js)
[![Coverage Status](https://coveralls.io/repos/kentcdodds/apiCheck.js/badge.svg?branch=master)](https://coveralls.io/r/kentcdodds/apiCheck.js?branch=master)


It's like [ReactJS `propTypes`](http://facebook.github.io/react/docs/reusable-components.html) without React. Actually,
it's very heavily inspired by this concept. It's purpose is for normal JavaScript functions rather than just React
Components.

![Demo Screenshot](other/screenshot.png)

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
  walk: function() {}
};

// if you only wish to check the first argument to a function, you don't need to supply an array.
function bar(a) {
  var errorMessage = apiCheck(apiCheck.string, arguments);
  if (errorMessage === null) {
    // success
  } else if (typeof errorMessage === 'string') {
    // there was a problem and errorMessage would like to tell you about it
  } else {
    // this should never happen... if it does, log a bug :-)
  }
}
```

## Differences from React's propTypes

Differences in [Supported Types](#supported-types) noted below with a *

- All types are required by default, to set something as optional, append `.optional`
- checkApi.js does not support `element` and `node` types
- checkApi.js supports a few additional types
- `object` fails on null. Use `object.nullOk` if you don't want that

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

## Supported types

### array

```javascript
apiCheck.array([]); // <-- true
apiCheck.array(23); // <-- false
```

### bool

```javascript
apiCheck.bool(false); // <-- true
apiCheck.bool('me bool too?'); // <-- false
```

### func

```javascript
apiCheck.func(function() {}); // <-- true
apiCheck.func(new RegExp()); // <-- false
```

### number

```javascript
apiCheck.number(423.32); // <-- true
apiCheck.number({}); // <-- false
```

### object *

`null` fails, use [`object.nullOk`](#objectnullok-) to allow null to pass

```javascript
apiCheck.object({}); // <-- true
apiCheck.object([]); // <-- false
apiCheck.object(null); // <-- false
```

#### object.nullOk *

*Not available in React's `propTypes`*

``` javascript
apiCheck.object.nullOk({}); // <-- true
apiCheck.object.nullOk([]); // <--- false
apiCheck.object.nullOk(null); // <-- true
```

### string

```javascript
apiCheck.string('I am a string!'); // <-- true
apiCheck.string([]); // <-- false
```

### instanceOf

```javascript
apiCheck.instanceOf(RegExp)(new RegExp); // <-- true
apiCheck.instanceOf(Date)('wanna go on a date?'); // <-- false
```

### oneOf

```javascript
apiCheck.oneOf(['Treek', ' Wicket Wystri Warrick'])('Treek'); // <-- true
apiCheck.oneOf(['Chewbacca', 'Snoova'])('Snoova'); // <-- false
```

### oneOfType

```javascript
apiCheck.oneOfType([apiCheck.string, apiCheck.object])({}); // <-- true
apiCheck.oneOfType([apiCheck.array, apiCheck.bool])('Kess'); // <-- false
```

### arrayOf

```javascript
apiCheck.arrayOf(apiCheck.string)(['Huraga', 'Japar', 'Kahless']); // <-- true
apiCheck.arrayOf(
  apiCheck.arrayOf(
    apiCheck.arrayOf(
      apiCheck.number
    )
  )
)([[[1,2,3], [4,5,6], [7,8,9]], [[1,2,3], [4,5,6], [7,8,9]]]); // <-- true (for realz)
apiCheck.arrayOf(apiCheck.bool)(['a', 'b', 'c']); // <-- false
```

### objectOf

```javascript
apiCheck.objectOf(apiCheck.arrayOf(apiCheck.bool))({a: [true, false], b: [false, true]}); // <-- true
apiCheck.objectOf(apiCheck.number)({a: 'not a number?', b: 'yeah, me neither (◞‸◟；)'}); // <-- false
```

### shape *

*Note: React `propTypes` __does__ support `shape`, however it __does not__ support the `strict` option*

If you add `strict = true` to the `shape`, then it will enforce that the given object does not have any extra properties
outside those specified in the `shape`. See below for an example...

```javascript
apiCheck.shape({
  name: checkers.shape({
    first: checkers.string,
    last: checkers.string
  }),
  age: checkers.number,
  isOld: checkers.bool,
  walk: checkers.func,
  childrenNames: checkers.arrayOf(checkers.string)
})({
  name: {
    first: 'Matt',
    last: 'Meese'
  },
  age: 27,
  isOld: false,
  walk: function() {},
  childrenNames: []
}); // <-- true
apiCheck.shape({
  mint: checkers.bool,
  chocolate: checkers.bool
})({mint: true}); // <-- false
```

Example of `strict`

```javascript
var strictShape = apiCheck.shape({
  cookies: apiCheck.bool,
  milk: apiCheck.bool,
  popcorn: apiCheck.bool.optional
});

strictShape.strict = true; // <-- that!

strictShape({
  cookies: true,
  milk: true,
  popcorn: true,
  candy: true
}); // <-- false because the extra `candy` property

strictShape({
  cookies: true,
  milk: true
}); // <-- true because it has no extra properties and `popcorn` is optional
```

#### shape.onlyIf *

*Not available in React's `propTypes`*

This can only be used in combination with `shape`

```javascript
apiCheck.shape({
  cookies: apiCheck.shape.onlyIf(['mint', 'chips'], apiCheck.bool)
})({cookies: true, mint: true, chips: true}); // <-- true

apiCheck.shape({
  cookies: apiCheck.shape.onlyIf(['mint', 'chips'], apiCheck.bool)
})({chips: true}); // <-- true (cookies not specified)

apiCheck.shape({
  cookies: apiCheck.shape.onlyIf('mint', apiCheck.bool)
})({cookies: true}); // <-- false
```

#### shape.ifNot *

*Not available in React's `propTypes`*

This can only be used in combination with `shape`

```javascript
apiCheck.shape({
  cookies: apiCheck.shape.ifNot('mint', apiCheck.bool)
})({cookies: true}); // <-- true

apiCheck.shape({
  cookies: apiCheck.shape.ifNot(['mint', 'chips'], apiCheck.bool)
})({cookies: true, chips: true}); // <-- false
```

### any

```javascript
apiCheck.any({}); // <-- true
apiCheck.any([]); // <-- true
apiCheck.any(true); // <-- true
apiCheck.any(false); // <-- true
apiCheck.any(/* seriously, anything */); // <-- true
apiCheck.any(3); // <-- true
apiCheck.any(3.1); // <-- true
apiCheck.any(3.14); // <-- true
apiCheck.any(3.141); // <-- true
apiCheck.any(3.1415); // <-- true
apiCheck.any(3.14159); // <-- true
apiCheck.any(3.141592); // <-- true
apiCheck.any(3.1415926); // <-- true
apiCheck.any(3.14159265); // <-- true
apiCheck.any(3.141592653); // <-- true
apiCheck.any(3.1415926535); // <-- true
apiCheck.any(3.14159265359); // <-- true
apiCheck.any(jfio,.jgo); // <-- Syntax error.... ಠ_ಠ
```

## Customization

### getErrorMessage

This is the method that apiCheck uses to get the message it throws or console.warns. If you don't like it, feel free to
make a better one by simply: `apiCheck.getErrorMessage = function(api, args, output) {/* return message */}`

### handleErrorMessage

This is the method that apiCheck uses to throw or warn the message. If you prefer to do your own thing, that's cool.
Simply `apiCheck.handleErrorMessage = function(message, shouldThrow) { /* throw or warn */ }`

### Disable apiCheck

It's a good idea to disable the apiCheck in production. To do this, simply invoke `disable()`

```javascript
apiCheck.disable();

// to re-enable it
apiCheck.enable();
```

## Credits

This library was written by [Kent C. Dodds](https://twitter.com/kentcdodds). Again, big credits go to the team working
on React for thinking up the api. This library was written from scratch, but I'd be lying if I didn't say that I
referenced their functions a time or two.
