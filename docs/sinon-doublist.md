Sinon.JS test double mixins.

_Source: [lib/sinon-doublist/index.js](../lib/sinon-doublist/index.js)_

- [module.exports](#moduleexports)
- [sinonDoublist](#sinondoublistsinon-test-disableautosandboxfalse)
- [mixin.createSandbox](#mixincreatesandboxsinon)
- [mixin.spyMany](#mixinspymanyobj-methods)
- [mixin.stubMany](#mixinstubmanyobj-methods)
- [mixin.stubWithReturn](#mixinstubwithreturnconfig)

# module.exports()

> Reference to `sinonDoublist()`.

# sinonDoublist(sinon, test, [disableAutoSandbox=false])

> Init sandbox and add its properties to the current context.

**Parameters:**

- `{object} sinon`
- `{object} test`
- `{boolean} [disableAutoSandbox=false]`

  - `true`: Manually augment `test` later via `test.createSandbox()`
  - `false`: Immediate augment `test` with `spy`, `stub`, etc.

# mixin.createSandbox(sinon)

> Init sandbox and add its properties to the current context.

To restore it: `this.sandbox.restore()`

**Parameters:**

- `{object} sinon`

# mixin.spyMany(obj, methods)

> Create a spy for one or more methods.

**Parameters:**

- `{object} obj` Double target object
- `{string | array} methods` One or more method names/paths

  - They do not have to exist, e.g. `obj` may be `{}` for convenience.
  - Accepts 'x.y.z' property paths.

**Return:**

`{object}` Stub(s) indexed by method name

# mixin.stubMany(obj, methods)

> Create a stub for one or more methods.

**Parameters:**

- `{object} obj` Double target object
- `{string | array} methods` One or more method names/paths

  - They do not have to exist, e.g. `obj` may be `{}` for convenience.
  - Accepts 'x.y.z' property paths.

**Return:**

`{object}` Stub(s) indexed by method name

# mixin.stubWithReturn(config)

> `withArgs()/returns()` combination wrapper with additional features.

**Optional features:**

- Instruct the stub to return an object with one or more that you can inspect later.
- Like `spyMany()` and `stubMany()`, an ad-hoc target object can be created for you.

**Example use case:**

The test subject is lib function `foo()` calling `bar()`
with expected arguments. But one of the arguments to `bar()`
is the return value of `baz()`. Use this helper to stub `baz()`
out of the picture to focus on the `foo()` and `bar()` relationship.

**Required `config`:**

- `{string} method` Stub target method name

**Optional `config`:**

- `{object} obj` Stub target object
- `{array} args` `withArgs()` arguments
- `{string|array} spies` Stub will return an object with spies given these names.
  - An alternative to setting an explicit `returns`.
- `{mixed} returns` Stub returns this value.
  - An alternative to returning spies.

**Parameters:**

- `{object} config` Expected arguments and returned value

**Return:**

`{object}` Properties depend on configuration.

- `{function} returnedSpy` *OR* `{object} returnedSpies`. Depends on whether spies is a string or array.
- `{function} &lt;method&gt;` The created stub. The property name will match the configured method name.
- `{object} target` Input `obj`, or `{}` if `obj` was null

_&mdash;generated by [apidox](https://github.com/codeactual/apidox)&mdash;_