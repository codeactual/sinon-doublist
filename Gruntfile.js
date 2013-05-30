module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('projName', 'sinon-doublist')
    .demand('instanceName', 'sinonDoublist')
    .demand('klassName', 'sinonDoublist')
    .loot('node-component-grunt')
    .loot('node-lib-grunt')
    .loot('./config/grunt')
    .attack();
};
