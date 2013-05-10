# sinon-doublist

[Sinon.JS](http://sinonjs.org/) test double mixins: `spyMany`, `stubMany`, `stubWithReturn`

* Double multiple methods in one call
* [sinon.testCase](http://sinonjs.org/docs/#sandbox)-like auto-sandboxing
* Optional use of plain empty objects to hold method doubles
* Method selection via `x.y.z` property path strings

[![Build Status](https://travis-ci.org/codeactual/sinon-doublist.png)](https://travis-ci.org/codeactual/sinon-doublist)

## Examples

### `spyMany()`

Create spies for multiple methods, even though the latter do not exist yet.

```js
sinonDoublist(sinon, 'mocha'); // Mix in function set and auto-sandbox.

describe('myFunction', function() {
  it('should do something', function() {
    var spy = this.spyMany({}, ['a.b.methodA', 'c.e.methodB', 'd.e.methodC']);
    spy['a.b.methodA'].restore();
  });
});
```

### `stubMany()`

Create a stub for method `foo()` that returns `false` only if called with argument 'bar'.

```js
sinonDoublist(sinon, 'mocha'); // Mix in function set and auto-sandbox.

describe('myFunction', function() {
  it('should do something', function() {
    var obj = {};
    var stub = this.stubMany(obj, 'foo');
    stub.foo.withArgs('bar').returns(false);
    stub.foo.restore();
  });
});
```

### `stubWithReturn()`

Create a stub that, if called with argument 'foo', returns object containing a spy at path `x.y.z`.

```js
sinonDoublist(sinon, 'mocha'); // Mix in function set and auto-sandbox.

describe('myFunction', function() {
  it('should do something', function() {
    var obj = {};

    stub = this.stubWithReturn({
      obj: obj,
      args: ['foo']
      method: 'methodD',
      spies: 'x.y.z'
    });
    var spiesReturnedFromStub = obj.methodD();
    spiesReturnedFromStub.x.y.z('foo');
    spiesReturnedFromStub.x.y.z.called.should.equal(true);
  });
});
```

## Installation

### [component](https://github.com/component/component)

    component install codeactual/sinon-doublist

### [NPM](https://npmjs.org/package/sinon-doublist)

    npm install sinon-doublist

## Related Projects

* [sinon-doublist-fs](https://github.com/codeactual/sinon-doublist-fs/): node.js `fs` stubbing.

## API

[Documentation](docs/sinon-doublist.md)

## License

  MIT

## Tests

### Node

    npm test

### Browser via [Karma](http://karma-runner.github.com/)

* `npm install karma`
* `karma start`
* Browse `http://localhost:9876/`
* `grunt build && karma run`

### jQuery 2.0

Custom [build](lib/jquery.js) used in `karma` test:

    grunt custom:-sizzle,-css,-effects,-offset,-dimensions,-deprecated,-ajax/script,-ajax/jsonp,-wrap,-event-alias
