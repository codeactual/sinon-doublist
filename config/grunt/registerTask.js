module.exports = function exports() {
  'use strict';

  const config = {};
  config.default = [this.learn('registerTask.default')[0].concat('shell:dist')];
  return config;
};
