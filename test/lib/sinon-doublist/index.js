/*eslint func-names: 0, new-cap: 0, no-unused-expressions: 0, no-wrap-func: 0*/
/*global mocha, sinonDoublist, jQuery, sinon, chai */

// For some reason eslint is reporting no-unused-vars for sinon/chai/sinonDoublist on this line:
'use strict'; // eslint-disable-line

var browserEnv = typeof window === 'object'; // eslint-disable-line block-scoped-var

if (browserEnv) {
  mocha.setup('bdd');
  mocha.setup({
    globals: [
      'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
      'XMLHttpRequest'
    ]
  });
} else {
  var chai = require('chai');// eslint-disable-line
  var sinon = require('sinon'); // eslint-disable-line
  var sinonChai = require('sinon-chai');// eslint-disable-line
  var sinonDoublist = require('../../..'); // eslint-disable-line
  chai.use(sinonChai);
}

var should = chai.should(); // eslint-disable-line
chai.config.includeStack = true; // eslint-disable-line

function initSinonDoublist() {
  sinonDoublist(sinon, this);
}

function cleanupSinonDoublist() {
  this.sandbox.restore();
}

describe('sinon-doublist', function() {
  beforeEach(initSinonDoublist);
  afterEach(cleanupSinonDoublist);

  describe('mixin', function() {
    it('should respect auto-sandbox opt-out', function() {
      const test = {};
      sinonDoublist(sinon, test, true);
      should.not.exist(test.sandbox);
    });
  });

  describe('#_createSandbox', function() {
    it('should mix in new sandbox', function() {
      should.exist(this.spy);
      should.exist(this.stub);
      should.exist(this.mock);
      should.not.exist(this.clock);
      if (browserEnv) {
        should.exist(this.server);
        should.exist(this.requests);
      }
    });

    it('should init fake server', function(testDone) {
      if (!browserEnv) { testDone(); return; }
      const payload = {foo: 'bar'};
      const url = '/res';
      const self = this;
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

  describe('clock', function() {
    it('should be real by default', function() {
      Date.now().should.not.equal(0);
    });

    it('should be fake if enabled', function() {
      Date.now().should.not.equal(0);
      this.clock = this.sandbox.useFakeTimers();
      Date.now().should.equal(0);

      const delta = 86400 * 1000;
      const then = Date.now();
      this.clock.tick(delta);
      Date.now().should.equal(then + delta);
    });

    it('should support disabling', function() {
      Date.now().should.not.equal(0);
      this.clock = this.sandbox.useFakeTimers();
      Date.now().should.equal(0);
      this.clock.tick(1);
      Date.now().should.equal(1);
      this.clock.restore();
      Date.now().should.be.gte(1);
    });
  });

  describe('#spyMany', function() {
    it('should proxy to _doubleMany', function() {
      let realCalled = false;
      const obj = {fn: function() { realCalled = true; }};
      const spy = this.spyMany(obj, 'fn');
      spy.fn();
      realCalled.should.equal(true);
      spy.fn.called.should.equal(true);
    });
  });

  describe('#stubMany', function() {
    it('should proxy to _doubleMany', function() {
      let realCalled = false;
      const obj = {fn: function() { realCalled = true; }};
      const stub = this.stubMany(obj, 'fn');
      stub.fn();
      realCalled.should.equal(false);
      stub.fn.called.should.equal(true);
    });
  });

  describe('#_doubleMany', function() {
    it('should accept multiple method names', function() {
      const called = [];
      const obj = {
        x: function() { called.push('x'); },
        y: function() { called.push('y'); }
      };
      const spy = this.spyMany(obj, ['x', 'y']);
      spy.x();
      called.should.deep.equal(['x']);
      spy.x.called.should.equal(true);
      spy.y();
      called.should.deep.equal(['x', 'y']);
      spy.y.called.should.equal(true);
    });

    it('should accept method path', function() {
      let realCalled = false;
      const obj = {x: {y: {z: function() { realCalled = true; }}}};
      const stub = this.stubMany(obj, 'x.y.z');
      stub['x.y.z']();
      realCalled.should.equal(false);
      stub['x.y.z'].called.should.equal(true);
    });

    it('should auto-create method if needed', function() {
      const obj = {};
      const stub = this.stubMany(obj, 'fn');
      stub.fn.called.should.equal(false);
      stub.fn();
      stub.fn.called.should.equal(true);
    });
  });

  describe('#stubWithReturn', function() {
    it('should detect unspecified method', function() {
      const self = this;
      (function() {
        self.stubWithReturn();
      }).should.Throw(Error, 'method not specified');
    });

    it('should handle non-existent method', function() {
      const obj = {};
      const stub = this.stubWithReturn({obj: obj, method: 'foo'});
      obj.foo();
      stub.foo.should.have.been.called;
    });

    it('should handle custom target object', function() {
      const obj = {foo: function() {}};
      const stub = this.stubWithReturn({obj: obj, method: 'foo'});
      stub.foo.should.not.have.been.called;
      stub.target.foo();
      stub.foo.should.have.been.called;
    });

    it('should handle missing target object', function() {
      const stub = this.stubWithReturn({method: 'foo'});
      stub.foo.should.not.have.been.called;
      stub.target.foo();
      stub.foo.should.have.been.called;
    });

    it('should handle plain-string spy name', function() {
      const stub = this.stubWithReturn({method: 'foo', spies: 'bond'});
      const returned = stub.target.foo();
      returned.bond();
      returned.bond.should.have.been.called;
    });

    it('should handle namespace-string spy name', function() {
      const stub = this.stubWithReturn({method: 'foo', spies: 'james.bond'});
      const returned = stub.target.foo();
      returned.james.bond();
      returned.james.bond.should.have.been.called;
    });

    it('should handle namespace-string spy name array', function() {
      const stub = this.stubWithReturn({method: 'foo', spies: ['j.a.m.e.s', 'b.o.n.d']});
      const returned = stub.target.foo();
      returned.j.a.m.e.s.should.not.have.been.called;
      returned.j.a.m.e.s();
      returned.j.a.m.e.s.should.have.been.called;
      returned.b.o.n.d.should.not.have.been.called;
      returned.b.o.n.d();
      returned.b.o.n.d.should.have.been.called;
    });

    it('should handle plain-string spy name array', function() {
      const stub = this.stubWithReturn({method: 'foo', spies: ['james', 'bond']});
      const returned = stub.target.foo();
      returned.james();
      returned.james.should.have.been.called;
      returned.bond();
      returned.bond.should.have.been.called;
    });

    it('should handle expected args', function() {
      const stub = this.stubWithReturn({method: 'foo', args: ['bar', 'baz']});
      should.not.exist(stub.target.foo());
      const spy = stub.target.foo('bar', 'baz');
      spy.should.not.have.been.called;
      spy();
      spy.should.have.been.called;
    });

    it('should handle custom stub return value', function() {
      const expected = noOp;
      const stub = this.stubWithReturn({method: 'foo', returns: expected});
      const returned = stub.target.foo();
      returned.should.deep.equal(expected);
    });
  });

  describe('#stubBind', function() {
    // Unclear why this extra cleanup became necessary somewhere between mocha 1.18.2 and 2.2.1
    beforeEach(initSinonDoublist);
    afterEach(cleanupSinonDoublist);

    beforeEach(function() {
      this.target = function() {};
      this.boundTarget = {iAmA: 'fake bound version of target'};
      this.stubWithReturnSpy = this.spy(this, 'stubWithReturn');
      this.bindStub = this.stubBind(this.target, null, 1, 2, 3).bind;
      this.bindStub.returns(this.boundTarget);
    });

    it('should wrap stubWithReturn', function() {
      this.stubWithReturnSpy.should.have.been.calledWithExactly(
        {obj: this.target, method: 'bind', args: [null, 1, 2, 3]}
      );
    });

    it('should stub bind', function() {
      should.not.exist(this.target.bind(null, 3, 2, 1));
      this.bindStub.called.should.equal(false);
      this.target.bind(null, 1, 2, 3).should.deep.equal(this.boundTarget);
      this.bindStub.called.should.equal(true);
    });
  });
});

function noOp() {}
