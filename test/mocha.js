var browserEnv = typeof window === 'object';

if (browserEnv) {
  mocha.setup('bdd');
} else {
  var sinon = require('sinon');
  var chai = require('chai');
  var sinonDoublist = require('..');
}

var should = chai.should();
chai.Assertion.includeStack = true;

sinonDoublist('mocha');

describe('sinon-doublist global injection for mocha', function() {
  'use strict';

  before(function(done) {
    this.target = function() { return true; };
    done();
  });

  it('should set up sandbox', function(testDone) {
    this.target().should.equal(true);
    should.not.exist(this.target.restore);

    this.stubMany(this, 'target');
    should.exist(this.target.restore);
    should.not.exist(this.target());
    testDone();
  });

  it('should tear down sandbox', function(testDone) {
    should.not.exist(this.target.restore);
    this.target().should.equal(true);
    testDone();
  });
});
