# sinon-doublist

Sinon.JS test double mixins.

[![Build Status](https://travis-ci.org/codeactual/sinon-doublist.png)](https://travis-ci.org/codeactual/sinon-doublist)

## Example

```js
describe('#foo()', function() {
  beforeEach(function() {
    sinonDoublist(sinon, this);
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  it('should make world peace', function() {
    this.spyMany(/* ... */);
    this.doubleMany(/* ... */);
    this.stubWithReturn(/* ... */);
  });
});
```

## Installation

### [Component](https://github.com/component/component)

Install to `components/`:

    $ component install codeactual/sinon-doublist

Build standalone file in `build/`:

    $ make dist

### NPM

    $ npm install sinon-doublist

## API

### #SinonDoublist(sinon, test[, disableAutoSandbox=false])

> Mix in #spyMany, etc. into the given `test` context object.

By default, also mixin a Sinon sandbox into `test` to replicate some `sinon.testCase` automation.

### #restoreSandbox()

> Calls sinon.sandbox#restore. Ex. use in a BDD-style `afterEach`.

### Object#spyMany(obj, <name|names>)

> Spy on one or more object methods.

* Method names can use `x.y.z` paths.
* Returns: Spies indexed by name.

### Object#stubMany(obj, <name|names>)

> Stub one or more object methods.

* Method names can use `x.y.z` paths.
* Returns: Stubs indexed by name.

### Object#stubWithReturn(config)

> Wrap a withArgs() + returns() sequence.

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
* `{object} target` Input `obj`, or `{}` if 'obj' was null.

## License

  MIT

## Tests

## Browser

`npm test`

### Browser via [Yeti](http://www.yeti.cx/)

* `npm install yeti`
* `yeti --server`
* Browse `http://localhost:9000`
* `make build && yeti test.html`

# Change Log

## 0.1.1

* Fix: Mixing in of `clock`, `server`, `requests`

## 0.1.0

* Added: `spyMany`, `stubMany`, `stubWithReturn`, `restoreSandbox`
