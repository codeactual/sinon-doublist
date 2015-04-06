/*eslint func-names: 0, new-cap: 0, no-unused-expressions: 0, no-wrap-func: 0*/
/*global mocha:1 sinon:1 chai:1 sinonDoublist:1 */

'use strict';

const browserEnv = typeof window === 'object'; // eslint-disable-line block-scoped-var

if (browserEnv) {
  mocha.setup('bdd');
} else {
  const sinon = require('sinon'); // eslint-disable-line no-unused-vars
  const chai = require('chai'); // eslint-disable-line no-unused-vars
  const sinonDoublist = require('..'); // eslint-disable-line no-unused-vars
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
