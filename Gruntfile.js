module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('initConfig.projName', 'sinon-doublist')
    .demand('initConfig.instanceName', 'sinonDoublist')
    .demand('initConfig.klassName', 'sinonDoublist')
    .loot('node-component-grunt')
    .loot('node-lib-grunt')
    .loot('./config/grunt')
    .attack();
};
