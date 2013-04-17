var browserEnv = typeof window === 'object';

if (browserEnv) {
  mocha.setup('bdd');
  mocha.setup({
    globals: [
      'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
      'XMLHttpRequest'
    ]
  });
} else {
  var chai = require('chai');
  var sinonDoublist = require('../../..');
}

var should = chai.should();
chai.Assertion.includeStack = true;

describe('sinon-doublist', function() {
  'use strict';

  beforeEach(function(done) {
    sinonDoublist(this);
    done();
  });

  afterEach(function(done) {
    this.sandbox.restore();
    done();
  });

  describe('mixin', function() {
    it('should respect auto-sandbox opt-out', function(testDone) {
      var test = {};
      sinonDoublist(test, true);
      should.not.exist(test.sandbox);
      testDone();
    });
  });

  describe('#_createSandbox()', function() {
    it('should mix in new sandbox', function(testDone) {
      should.exist(this.spy);
      should.exist(this.stub);
      should.exist(this.mock);
      should.exist(this.clock);
      if (browserEnv) {
        should.exist(this.server);
        should.exist(this.requests);
      }
      testDone();
    });

    it('should init fake server', function(testDone) {
      if (!browserEnv) { testDone(); return; }
      var payload = {foo: 'bar'};
      var url = '/res';
      var self = this;
      jQuery.ajax({
        url: url,
        success: function(response) {
          response.should.deep.equal(payload);
          self.requests.length.should.equal(1);
          self.requests[0].url.should.equal(url);
          testDone();
        }
      });
      this.server.respond([
          200,
          {'Content-Type': 'application/json'},
          JSON.stringify(payload)
        ]
      );
    });
  });

  describe('#restoreSandbox()', function() {
    it('should restore sandbox', function(testDone) {
      var realCalled = false;
      var obj = {fn: function() { realCalled = true; }};
      this.stubMany(obj, 'fn');
      obj.fn();
      realCalled.should.equal(false);
      this.restoreSandbox();
      obj.fn();
      realCalled.should.equal(true);
      testDone();
    });
  });

  describe('clock', function() {
    it('should be fake', function(testDone) {
      var delta = 86400 * 1000;
      var then = Date.now();
      this.clock.tick(delta);
      Date.now().should.equal(then + delta);
      testDone();
    });
  });

  describe('#spyMany()', function() {
    it('should proxy to _doubleMany()', function(testDone) {
      var realCalled = false;
      var obj = {fn: function() { realCalled = true; }};
      var spy = this.spyMany(obj, 'fn');
      spy.fn();
      realCalled.should.equal(true);
      spy.fn.called.should.equal(true);
      testDone();
    });
  });

  describe('#stubMany()', function() {
    it('should proxy to _doubleMany()', function(testDone) {
      var realCalled = false;
      var obj = {fn: function() { realCalled = true; }};
      var stub = this.stubMany(obj, 'fn');
      stub.fn();
      realCalled.should.equal(false);
      stub.fn.called.should.equal(true);
      testDone();
    });
  });

  describe('#_doubleMany()', function() {
    it('should accept multiple method names', function(testDone) {
      var called = [];
      var obj = {
        x: function() { called.push('x'); },
        y: function() { called.push('y'); }
      };
      var spy = this.spyMany(obj, ['x', 'y']);
      spy.x();
      called.should.deep.equal(['x']);
      spy.x.called.should.equal(true);
      spy.y();
      called.should.deep.equal(['x', 'y']);
      spy.y.called.should.equal(true);
      testDone();
    });

    it('should accept method path', function(testDone) {
      var realCalled = false;
      var obj = {x: {y: {z: function() { realCalled = true; }}}};
      var stub = this.stubMany(obj, 'x.y.z');
      stub['x.y.z']();
      realCalled.should.equal(false);
      stub['x.y.z'].called.should.equal(true);
      testDone();
    });

    it('should auto-create method if needed', function(testDone) {
      var obj = {};
      var stub = this.stubMany(obj, 'fn');
      stub.fn.called.should.equal(false);
      stub.fn();
      stub.fn.called.should.equal(true);
      testDone();
    });
  });

  describe('#stubWithReturn()', function() {
    it('should detect unspecified method', function(testDone) {
      var self = this;
      (function() {
        self.stubWithReturn();
      }).should.Throw(Error, 'method not specified');
      testDone();
    });

    it('should handle non-existent method', function(testDone) {
      var obj = {};
      var stub = this.stubWithReturn({obj: obj, method: 'foo'});
      obj.foo();
      stub.foo.should.have.been.called;
      testDone();
    });

    it('should handle custom target object', function(testDone) {
      var obj = {foo: function() {}};
      var stub = this.stubWithReturn({obj: obj, method: 'foo'});
      stub.foo.should.not.have.been.called;
      stub.target.foo();
      stub.foo.should.have.been.called;
      testDone();
    });

    it('should handle missing target object', function(testDone) {
      var stub = this.stubWithReturn({method: 'foo'});
      stub.foo.should.not.have.been.called;
      stub.target.foo();
      stub.foo.should.have.been.called;
      testDone();
    });

    it('should handle plain-string spy name', function(testDone) {
      var stub = this.stubWithReturn({method: 'foo', spies: 'bond'});
      var returned = stub.target.foo();
      returned.bond();
      returned.bond.should.have.been.called;
      testDone();
    });

    it('should handle namespace-string spy name', function(testDone) {
      var stub = this.stubWithReturn({method: 'foo', spies: 'james.bond'});
      var returned = stub.target.foo();
      returned.james.bond();
      returned.james.bond.should.have.been.called;
      testDone();
    });

    it('should handle namespace-string spy name array', function(testDone) {
      var stub = this.stubWithReturn({method: 'foo', spies: ['j.a.m.e.s', 'b.o.n.d']});
      var returned = stub.target.foo();
      returned.j.a.m.e.s.should.not.have.been.called;
      returned.j.a.m.e.s();
      returned.j.a.m.e.s.should.have.been.called;
      returned.b.o.n.d.should.not.have.been.called;
      returned.b.o.n.d();
      returned.b.o.n.d.should.have.been.called;
      testDone();
    });

    it('should handle plain-string spy name array', function(testDone) {
      var stub = this.stubWithReturn({method: 'foo', spies: ['james', 'bond']});
      var returned = stub.target.foo();
      returned.james();
      returned.james.should.have.been.called;
      returned.bond();
      returned.bond.should.have.been.called;
      testDone();
    });

    it('should handle expected args', function(testDone) {
      var stub = this.stubWithReturn({method: 'foo', args: ['bar', 'baz']});
      should.not.exist(stub.target.foo());
      var spy = stub.target.foo('bar', 'baz');
      spy.should.not.have.been.called;
      spy();
      spy.should.have.been.called;
      testDone();
    });

    it('should handle custom stub return value', function(testDone) {
      var expected = noOp;
      var stub = this.stubWithReturn({method: 'foo', returns: expected});
      var returned = stub.target.foo();
      returned.should.deep.equal(expected);
      testDone();
    });
  });
});

function noOp() {}