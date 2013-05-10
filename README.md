# sinon-doublist

[Sinon.JS](http://sinonjs.org/) test double mixins: [spyMany](#spymany), [stubMany](#stubmany), [stubWithReturn](#stubwithreturn)

* Double multiple methods in one call
* [sinon.testCase](http://sinonjs.org/docs/#sandbox)-like auto-sandboxing
* Optional use of plain empty objects to hold method doubles
* Method selection via `x.y.z` property path strings

[![Build Status](https://travis-ci.org/codeactual/sinon-doublist.png)](https://travis-ci.org/codeactual/sinon-doublist)

## Examples

### Mixin (recommended)

```js
sinonDoublist(sinon, 'mocha');

describe('myFunction', function() {
  it('should do something', function() {
    // this.spyMany()
    // this.stubMany()
    // this.stubWithReturn()
  });
});
```

### Mixin (manual)

```js
describe('myFunction', function() {
  beforeEach(function() {
    sinonDoublist(sinon, this);
  });
  
  afterEach(function() {
    this.sandbox.restore();
  });
  
  it('should do something', function() {
    // this.spyMany()
    // this.stubMany()
    // this.stubWithReturn()
  });
});
```

### `spyMany()`

Creates spies for multiple methods, even though the latter do not exist yet. 

```js
var spy = this.spyMany({}, ['a.b.methodA', 'c.e.methodB', 'd.e.methodC']);
spy['a.b.methodA'].restore();
```

### `stubMany()`

Creates a stub for method `foo()` that returns `false` only if called with argument 'bar'.

```js
var obj = {};
var foo = this.stubMany(obj, 'foo').foo;
foo.withArgs('bar').returns(false);
foo.restore();
```

### `stubWithReturn()`

Creates a stub that, if called with argument 'foo', returns object containing a spy at path `x.y.z`.

```js
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
