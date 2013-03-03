var browserEnv = typeof window === 'object';

if (browserEnv) {
  mocha.setup('bdd');
} else {
  var sinon = require('sinon');
  var chai = require('chai');
  var sinonDoublist = require('./build/sinon-doublist');
}

var should = chai.should();
chai.Assertion.includeStack = true;

describe('sinon-doublist', function() {
  'use strict';

  beforeEach(function(done) {
    sinonDoublist(sinon, this);
    done();
  });

  afterEach(function(done) {
    this.sandbox.restore();
    done();
  });

  describe('#stubWithReturn()', function() {
    it('should detect unspecified method', function(testDone) {
      var self = this;
      (function() {
        self.stubWithReturn();
      }).should.Throw(Error, 'method not specified');
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

if (browserEnv) {
  mocha.run();
}

function noOp() {}
