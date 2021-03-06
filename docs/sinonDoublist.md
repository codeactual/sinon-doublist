Sinon.JS test double mixins.

_Source: [lib/sinon-doublist/index.js](../lib/sinon-doublist/index.js)_

<a name="tableofcontents"></a>

- <a name="toc_moduleexports"></a><a name="toc_module"></a>[module.exports](#moduleexports)
- <a name="toc_sinondoublistsinon-test-disableautosandboxfalse"></a>[sinonDoublist](#sinondoublistsinon-test-disableautosandboxfalse)
- <a name="toc_mixincreatesandboxsinon"></a><a name="toc_mixin"></a>[mixin.createSandbox](#mixincreatesandboxsinon)
- <a name="toc_mixinspymanyobj-methods"></a>[mixin.spyMany](#mixinspymanyobj-methods)
- <a name="toc_mixinstubmanyobj-methods"></a>[mixin.stubMany](#mixinstubmanyobj-methods)
- <a name="toc_mixinstubwithreturnconfig"></a>[mixin.stubWithReturn](#mixinstubwithreturnconfig)
- <a name="toc_mixinstubbindfn-args"></a>[mixin.stubBind](#mixinstubbindfn-args)

<a name="module"></a>

# module.exports()

> Reference to `sinonDoublist()`.

<sub>Go: [TOC](#tableofcontents) | [module](#toc_module)</sub>

# sinonDoublist(sinon, test, [disableAutoSandbox=false])

> Init sandbox and add its properties to the current context.

**Parameters:**

- `{object} sinon`
- `{string | object} test`
  - `{object}` Current test context, ex. `this` inside a 'before each' hook, to receive the sandbox/mixins
  - `{string}` Name of supported adapter which will automatically set up and tear down the sandbox/mixins
  - Adapters: 'mocha'

- `{boolean} [disableAutoSandbox=false]`
  - `true`: Manually augment `test` later via `test.createSandbox()`
  - `false`: Immediate augment `test` with `spy`, `stub`, etc.

<sub>Go: [TOC](#tableofcontents)</sub>

<a name="mixin"></a>

# mixin.createSandbox(sinon)

> Init sandbox and add its properties to the current context.

- Unlike `sinon.sandbox.create`, timers are not faked. See "Gotchas" in README.md for more details.

To restore: `this.sandbox.restore()`

**Parameters:**

- `{object} sinon`

**See:**

- [Gotchas](../README.md#gotchas)

<sub>Go: [TOC](#tableofcontents) | [mixin](#toc_mixin)</sub>

# mixin.spyMany(obj, methods)

> Create a spy for one or more methods.

**Parameters:**

- `{object} obj` Target object
- `{string | array} methods`
  - They do not have to exist, e.g. `obj` may be `{}` for convenience.
  - Accepts `x.y.z` property paths.

**Return:**

`{object}` Stub(s) indexed by method name

<sub>Go: [TOC](#tableofcontents) | [mixin](#toc_mixin)</sub>

# mixin.stubMany(obj, methods)

> Create a stub for one or more methods.

**Parameters:**

- `{object} obj` Target object
- `{string | array} methods`
  - They do not have to exist, e.g. `obj` may be `{}` for convenience.
  - Accepts `x.y.z` property paths.

**Return:**

`{object}` Stub(s) indexed by method name

<sub>Go: [TOC](#tableofcontents) | [mixin](#toc_mixin)</sub>

# mixin.stubWithReturn(config)

> `withArgs()/returns()` combination wrapper with additional features.

**Optional features:**

- Instruct the stub to return an object with one or more spies that you can inspect later.
- Neither the target method(s), nor target object, need to preexist.

**Example use case:**

The test subject is a lib function `foo()` calling `bar()` with expected arguments.
But one of the arguments to `bar()` is the return value of a 3rd method, `baz()`.
`baz()` is irrelevant to this test, so use this helper to stub `baz()` out
of the picture to focus on the `foo()-bar()` relationship.

**Required `config`:**

- `{string} method` Method to stub in `obj` (or new object created on-the-fly)

**Optional `config`:**

- `{object} obj` Target object
- `{array} args` `withArgs()` arguments
- `{string|array} spies` Stub will return an object with spies in these properties.
  - An alternative to setting an explicit `returns`
- `{mixed} returns` Stub returns this value
  - An alternative to returning an object with configured with `spies`

**Parameters:**

- `{object} config` Expected arguments and returned value

**Return:**

`{object}` Properties depend on configuration.

- `{function} returnedSpy` **OR** `{object} returnedSpies`. Depends on whether `spies` is a `string` or `array`.
- `{function} <method>` The created stub(s). The property name(s) will match `method`.
- `{object} target` Input `obj`, or `{}` if `obj` was falsey

<sub>Go: [TOC](#tableofcontents) | [mixin](#toc_mixin)</sub>

# mixin.stubBind(fn, args*)

> Stub a function's `bind` method w/ expected arguments.

- Convenience wrapper around [mixin.stubWithReturn](#mixinstubwithreturnconfig).

**Usage:**

```js
function target() {}
function fakeBoundTarget() {}

var stub = this.stubBind(target, null, 1, 2, 3).bind;
stub.bind.returns(fakeBoundTarget);

target.bind(null, 3, 2, 1); // undefined
console.log(stub.bind.called); // false

target.bind(null, 1, 2, 3); // fakeBoundTarget
console.log(stub.bind.called); // true
```

**Parameters:**

- `{function} fn`
- `{mixed} args*` `bind` arguments
  - They do not have to exist, e.g. `obj` may be `{}` for convenience.

**Return:**

`{object}` Same as [mixin.stubWithReturn](#mixinstubwithreturnconfig)

<sub>Go: [TOC](#tableofcontents) | [mixin](#toc_mixin)</sub>

_&mdash;generated by [apidox](https://github.com/codeactual/apidox)&mdash;_
