module.exports = function exports() {
  'use strict';

  return {
    dist: {
      command: './node_modules/.bin/browserify lib/sinon-doublist/index.js --standalone sinonDoublist -o dist/sinon-doublist.js'
    }
  };
};
