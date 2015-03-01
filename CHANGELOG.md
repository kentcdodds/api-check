# Latest

- Fixing the way the `enums` shortType looks.
- Adding child checker to `func` called `withProperties` which is basically just a `shape` on a function.
- Making an adjustment to how `location` works in `shape`. This makes it more readable.

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
