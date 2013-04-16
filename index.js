/**
 * Rebundle the component module to inject a node-land require().
 *
 * This enables:
 * - Auto-injection of the node-land require() when installed w/ NPM.
 * - Manual-injection when install w/ component.
 */
module.exports = require('./dist/sinon-doublist');
module.exports.requireNative = require;
