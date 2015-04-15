module.exports = function exports() {
  'use strict';

  const config = {};
  config.default = [this.learn('registerTask.default')[0].concat('shell:dist')];
  config.test = [this.learn('registerTask.test')[0].concat('shell:test_mocha_adapter')];
  return config;
};
