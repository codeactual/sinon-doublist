module.exports = function exports() {
  'use strict';

  const srcFiles = this.learn('initConfig.eslint.src.src') || [];
  this.demand('initConfig.eslint.src.src', srcFiles.concat('!lib/jquery.js'));
};
