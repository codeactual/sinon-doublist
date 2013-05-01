# sinon-doublist

Sinon.JS test double mixins: [spyMany](https://github.com/codeactual/sinon-doublist/#api), [stubMany](https://github.com/codeactual/sinon-doublist/#api), [stubWithReturn](https://github.com/codeactual/sinon-doublist/#api).

* Optional [sinon.testCase](http://sinonjs.org/docs/#sandbox)-like auto-sandboxing.
* Supports optional use of plain empty objects to hold method doubles.
* Multi-method doubling via array arguments.
* Deep-object method selection via "x.y.z" property path strings.

[![Build Status](https://travis-ci.org/codeactual/sinon-doublist.png)](https://travis-ci.org/codeactual/sinon-doublist)

## Examples

```js
sinonDoublist(sinon, 'mocha'); // Mix in function set and auto-sandbox.

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

### [NPM](https://npmjs.org/package/sinon-doublist)

    npm install sinon-doublist

## Related Components

* [sinon-doublist-fs](https://github.com/codeactual/sinon-doublist-fs/): node.js `fs` stubbing.

## Documentation

[API](docs/sinon-doublist.md)

## License

  MIT

## Tests

### Node

    npm test

### Browser via [Karma](http://karma-runner.github.com/)

* `npm install karma`
* `karma start`
* Browse `http://localhost:9876/`
* `make build && karma run`
