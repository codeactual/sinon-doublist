module.exports = function exports() {
  'use strict';

  return {
    test_mocha_adapter: {
      command: './node_modules/.bin/mocha --colors --reporter spec test/mocha.js'
    },
    dist: {
      command: './node_modules/.bin/browserify lib/sinon-doublist/index.js --standalone sinonDoublist -o dist/sinon-doublist.js'
    }
  };
};
