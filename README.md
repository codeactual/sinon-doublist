# sinon-doublist

Sinon.JS test double mixins: [spyMany](https://github.com/codeactual/sinon-doublist/#api), [stubMany](https://github.com/codeactual/sinon-doublist/#api), [stubWithReturn](https://github.com/codeactual/sinon-doublist/#api).

* Supports optional use of plain empty objects to hold method doubles.
* Multi-method doubling via array arguments.
* Deep-object method selection via "x.y.z" property path strings.

[![Build Status](https://travis-ci.org/codeactual/sinon-doublist.png)](https://travis-ci.org/codeactual/sinon-doublist)

## Examples

```js
sinonDoublist(sinon, 'mocha');

describe('myFunction', function() {
  it('should do something', function() {
    var obj = {};

    var spy = this.spyMany(obj, ['a.b.methodA', 'c.e.methodB', 'd.e.methodC']);
    spy['a.b.methodA'].restore();

    obj = {methodD: function() {}};
    var stub = this.stubMany(obj, 'methodD');
    stub.methodD.returns(false);
    stub.methodD.restore();

    obj = {};
    stub = this.stubWithReturn({
      obj: obj,
      method: 'methodD',
      spies: 'f.e.g'
    });
    var spiesReturnedFromStub = obj.methodD();
    spiesReturnedFromStub.f.e.g();
    spiesReturnedFromStub.f.e.g.called.should.equal(true);
  });
});
```

## Installation

### [Component](https://github.com/component/component)

Install to `components/`:

    $ component install codeactual/sinon-doublist

Build standalone file in `build/`:

    $ make dist

## Related Components

* [sinon-doublist-fs](https://github.com/codeactual/sinon-doublist-fs/): node.js `fs` stubbing.

## API

### #sinonDoublist(sinon, test[, disableAutoSandbox=false])

> Mix function set into the given `test` context object. Ex. use in a BDD-style `beforeEach`.

By default, also mixin a Sinon sandbox into `test` to replicate some `sinon.testCase` automation.

### #sinonDoublist(sinon, 'mocha'[, disableAutoSandbox=false])

> Same mixin operation as above but with automatic `beforeEach/afterEach` boilerplating in mocha.

### #restoreSandbox()

> Calls `sinon.sandbox#restore`. Ex. use in a BDD-style `afterEach`.

### Object#spyMany(obj, <name|names>)

> Spy on one or more object methods.

* Method names can use `x.y.z` paths.
* Returns: Spies indexed by name.

### Object#stubMany(obj, <name|names>)

> Stub one or more object methods.

* Method names can use `x.y.z` paths.
* Returns: Stubs indexed by name.

### Object#stubWithReturn(config)

> Wrap a `withArgs()` + `returns()` sequence.

Required fields:

* `{string} method` Stub target method name, ex. 'bind'.

Optional fields:

* `{object} obj` Stub target object, ex. underscore.
* `{array} args` Arguments 'method' expects to receive.
* `{string|array} spies` Stub will return an object with spies given these names.
 * An alternative to setting an explicit `returns`.
* `{mixed} returns` Stub returns this value.
 * An alternative to setting  `spies`.

Return:

* `{function} returnedSpy` or `{object} returnedSpies` Depends on whether `spies` is a string or array.
* `{function} <method>` The created stub. The property name will match the configured `method` name.
* `{object} target` Reference to the input `obj` or auto-creeated `{}`.

## License

  MIT

## Tests

### Node

    npm install --devDependencies
    npm test

### Browser via [Testacular](http://testacular.github.com/)

* `npm install testacular`
* `testacular start`
* Browse `http://localhost:9876/`
* `make build && testacular run`

## Change Log

### 0.2.2

* `stubWithReturn` now creates `method` if it does not exist in the target object.

### 0.2.1

* Fix: `requests` now correctly points to `server.requests`.

### 0.2.0

* Add: Global injection of mixin methods for mocha via `sinonDoublist(sinon, 'mocha')`.

### 0.1.2

* Fix: Test context could not re-create sandboxes after restoring them. Prevented fake timers from working in `beforeEach/afterEach`-style cycles.

### 0.1.1

* Fix: Mixing in of `clock`, `server`, `requests`

### 0.1.0

* Added: `spyMany`, `stubMany`, `stubWithReturn`, `restoreSandbox`
