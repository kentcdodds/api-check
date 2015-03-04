# 6.0.10

- Making output of user's arguments easier to read by replacing `null` with the function name.

# 6.0.9

- Fixing bug with optional arguments.

# 6.0.8

- Fixing bug when specifying custom functions that don't have a `type` property.

# 6.0.7

- Removing `.idea` folder from npm and bower. (－‸ლ)

# 6.0.6

- Adding `passed`, `failed`, and `message` to what is returned when apiCheck passes (or when it's disabled).
- Loosening the api to `apiCheck`. You now can pass an array instead of an arguments-like object. It's much easier to deal with if you're not actually passing arguments.

# 6.0.5

- Fixing bug where optional arguments were being tested against the wrong checkers.

# 6.0.4

- Fixing bug with `onlyIf` when getting the type for a `shape`.

# 6.0.3

- Adding .npmignore
- correctly returning what should be returned when it's disabled

# 6.0.2

- Adding `utils` to the main export.

# 6.0.1

- Somehow I forgot to run the build for 6.0.0

# 6.0.0

- You must now create an instance of `apiCheck` by invoking `apiCheck`. This allows multiple instances on a single page so many libraries can use their own instance and not conflict with the application's instance. Specifically useful for the global config options. ([#7](/../../issues/7))

# 5.0.0

- Adding extra output options to override the global ones on a per call basis.
- Changing `output.url` to `output.urlSuffix` in favor of `output.url` overriding the rest of the url
- Fixing bug with ending optional arguments

# 4.0.1

- Forgot to give the same love to `shape.strict` that I gave to `shape`.
- Relaxing the requirements of a type checker

# 4.0.0

- Fixing the way the `enums` shortType looks.
- Adding child checker to `func` called `withProperties` which is basically just a `shape` on a function.
- Making an adjustment to how `location` works in `shape`. This makes it more readable.
- Adding the ability to specify a `help` property string/function(val) on custom checkers. This (or the result of the invoked function) will be appended to the error message.
- Adding more strict type checking for custom checkers.
- Adding the ability to specify whether you want `shape` to check if it's an object first (pass `true` as the second parameter, and it will not check whether it's an object first).
- Adding `apiCheck.config.verbose`.
- type checkers can now control how much data they output based on whether `apiCheck.config.verbose` is true or not. If they specify their `type` as a function, that will be invoked and what is returned is used for the type for display. ([#5](/../../issues/5))
- `shape` taking advantage of the new `.type` function api to show where exactly in the object the error occurred and whether it was a result of a missing field that was required or a field that failed type validation.

# 3.0.4

- Fixing oneOfType's `type`

# 3.0.3

- Bug fix. The argTypes should be an object, not stringified ([#3](/../../issues/3))

# 3.0.2

- Missed a console.log :-/ Should probably put in a checker for that...

# 3.0.1

- Quick breaking change, hopefully nobody will be impacted because it was literally minutes. Now returning an object instead of just a string message. This make things much more flexible.

# 3.0.0

- Seriously improved how the messages are formatted. There's a lot more there, but it's awesome.

# 2.0.1

- Returning the message from apiCheck.warn/throw. Though, if an error is actually thrown, then any responding code to the returned message will not run...

# 2.0.0

- Major internal api changes. All checkers now return an error like React's `propTypes` and the messaging has been improved.

# 1.0.1

- Updating readme

# 1.0.0

- Initial release. Enjoy :-)
