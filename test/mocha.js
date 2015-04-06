/*eslint func-names: 0, new-cap: 0, no-unused-expressions: 0, no-wrap-func: 0*/
/*global mocha, chai, sinonDoublist */

// For some reason eslint is reporting no-unused-vars for sinon/sinonDoublist on this line:
'use strict'; // eslint-disable-line

const browserEnv = typeof window === 'object'; // eslint-disable-line block-scoped-var

if (browserEnv) {
  mocha.setup('bdd');
} else {
  var sinon = require('sinon'); // eslint-disable-line
  var chai = require('chai'); // eslint-disable-line
  var sinonDoublist = require('..'); // eslint-disable-line
}

const should = chai.should();
chai.config.includeStack = true;

sinonDoublist(sinon, 'mocha'); // eslint-disable-line

describe('sinon-doublist global injection for mocha', function() {
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
