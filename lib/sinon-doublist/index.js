/**
 * Sinon.JS test double mixins.
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

'use strict';

/**
 * Reference to `sinonDoublist()`.
 */
module.exports = sinonDoublist;

/**
 * Init sandbox and add its properties to the current context.
 *
 * @param {object} sinon
 * @param {string|object} test
 * - `{object}` Current test context, ex. `this` inside a 'before each' hook, to receive the sandbox/mixins
 * - `{string}` Name of supported adapter which will automatically set up and tear down the sandbox/mixins
 * - Adapters: 'mocha'
 * @param {boolean} [disableAutoSandbox=false]
 * - `true`: Manually augment `test` later via `test.createSandbox()`
 * - `false`: Immediate augment `test` with `spy`, `stub`, etc.
 */
function sinonDoublist(sinon, test, disableAutoSandbox) {
  if (typeof test === 'string') {
    adapters[test](sinon, disableAutoSandbox);
    return;
  }

  Object.keys(mixin).forEach(function forEachKey(method) {
    test[method] = mixin[method].bind(test);
  });
  if (!disableAutoSandbox) {
    test.createSandbox(sinon);
  }
}

const is = require('is');
const pathval = require('pathval');
const setPathValue = pathval.set;
const getPathValue = pathval.get;
const mixin = {};
const browserEnv = typeof window === 'object'; // eslint-disable-line block-scoped-var

/**
 * Init sandbox and add its properties to the current context.
 *
 * - Unlike `sinon.sandbox.create`, timers are not faked. See "Gotchas" in README.md for more details.
 *
 * To restore: `this.sandbox.restore()`
 *
 * @param {object} sinon
 * @see [Gotchas](../README.md#gotchas)
 */
mixin.createSandbox = function createSandbox(sinon) {
  this.sandbox = sinon.sandbox.create();
  this.spy = this.sandbox.spy.bind(this.sandbox);
  this.stub = this.sandbox.stub.bind(this.sandbox);
  this.mock = this.sandbox.mock.bind(this.sandbox);
  this.server = this.sandbox.useFakeServer();
  if (browserEnv) {
    this.requests = this.server.requests;
  }
};

/**
 * Create a spy for one or more methods.
 *
 * @param {object} obj Target object
 * @param {string|array} methods
 * - They do not have to exist, e.g. `obj` may be `{}` for convenience.
 * - Accepts `x.y.z` property paths.
 * @return {object} Stub(s) indexed by method name
 */
mixin.spyMany = function spyMany(obj, methods) {
  // Use call() to propagate the context bound in beforeEach().
  return this.doubleMany.call(this, 'spy', obj, methods);
};

/**
 * Create a stub for one or more methods.
 *
 * @param {object} obj Target object
 * @param {string|array} methods
 * - They do not have to exist, e.g. `obj` may be `{}` for convenience.
 * - Accepts `x.y.z` property paths.
 * @return {object} Stub(s) indexed by method name
 */
mixin.stubMany = function stubMany(obj, methods) {
  // Use call() to propagate the context bound in beforeEach().
  return this.doubleMany.call(this, 'stub', obj, methods);
};

/**
 * `withArgs()/returns()` combination wrapper with additional features.
 *
 * Optional features:
 *
 * - Instruct the stub to return an object with one or more spies that you can inspect later.
 * - Neither the target method(s), nor target object, need to preexist.
 *
 * Example use case:
 *
 * The test subject is a lib function `foo()` calling `bar()` with expected arguments.
 * But one of the arguments to `bar()` is the return value of a 3rd method, `baz()`.
 * `baz()` is irrelevant to this test, so use this helper to stub `baz()` out
 * of the picture to focus on the `foo()-bar()` relationship.
 *
 * Required `config`:
 *
 * - `{string} method` Method to stub in `obj` (or new object created on-the-fly)
 *
 * Optional `config`:
 *
 * - `{object} obj` Target object
 * - `{array} args` `withArgs()` arguments
 * - `{string|array} spies` Stub will return an object with spies in these properties.
 *   - An alternative to setting an explicit `returns`
 * - `{mixed} returns` Stub returns this value
 *   - An alternative to returning an object with configured with `spies`
 *
 * @param {object} config Expected arguments and returned value
 * @return {object} Properties depend on configuration.
 * - `{function} returnedSpy` **OR** `{object} returnedSpies`. Depends on whether `spies` is a `string` or `array`.
 * - `{function} <method>` The created stub(s). The property name(s) will match `method`.
 * - `{object} target` Input `obj`, or `{}` if `obj` was falsey
 */
mixin.stubWithReturn = function stubWithReturn(config) {
  config = config || {};

  let stub;
  let returns;
  const isReturnsConfigured = config.hasOwnProperty('returns');
  const payload = {};

  if (!is.string(config.method) || !config.method.length) {
    throw new Error('method not specified');
  }

  // Allow test to avoid creating the config.obj ahead of time.
  if (config.obj) {
    stub = this.stubMany(config.obj, config.method)[config.method];
  } else {
    config.obj = {};
    stub = this.stubMany(config.obj, config.method)[config.method];
  }

  // Detect the need for withArgs().
  if (is.array(config.args) && config.args.length) {
    stub = stub.withArgs.apply(stub, config.args);
  }

  // Create the stub return value. Either a spy itself or hash of them.
  if (config.spies) {
    returns = {};

    // 'a.b.c.spy1'
    if (is.string(config.spies) && /\./.test(config.spies)) {
      setPathValue(returns, config.spies, this.spy());
    } else {
      const spies = [].concat(config.spies);
      for (let s = 0; s < spies.length; s++) {
        setPathValue(returns, spies[s], this.spy());
      }
    }
  } else {
    if (isReturnsConfigured) {
      returns = config.returns;
    } else {
      returns = this.spy();
    }
  }
  stub.returns(returns);

  if (!isReturnsConfigured) {
    if (is.function(returns)) {
      payload.returnedSpy = returns;
    } else {
      payload.returnedSpies = returns;
    }
  }
  payload[config.method] = stub;
  payload.target = config.obj;

  return payload;
};

/**
 * Spy/stub one or more methods of an object.
 *
 * @param {string} type 'spy' or 'stub'
 * @param {object} obj  Target object
 * @param {string|array} methods One or more method names/namespaces
 * - They do not have to exist, e.g. `obj` may be `{}` for convenience.
 * @return {object} Doubles indexed by method name
 * @api private
 */
mixin.doubleMany = function doubleMany(type, obj, methods) {
  const self = this;
  const doubles = {};
  methods = [].concat(methods);

  for (let m = 0; m < methods.length; m++) {
    const method = methods[m];

    // Sinon requires doubling target to exist.
    if (!getPathValue(obj, method)) {
      setPathValue(obj, method, sinonDoublistNoOp);
    }

    if (/\./.test(method)) { // Ex. 'a.b.c'
      doubles[method] = self[type](
        getPathValue(obj, method.split('.').slice(0, -1).join('.')), // Ex. 'a.b'
        method.split('.').slice(-1)  // Ex. 'c'
      );
    } else {
      doubles[method] = self[type](obj, method);
    }
  }

  return doubles;
};

/**
 * Stub a function's `bind` method w/ expected arguments.
 *
 * - Convenience wrapper around mixin.stubWithReturn.
 *
 * Usage:
 *
 *     function target() {}
 *     function fakeBoundTarget() {}
 *
 *     const stub = this.stubBind(target, null, 1, 2, 3).bind;
 *     stub.bind.returns(fakeBoundTarget);
 *
 *     target.bind(null, 3, 2, 1); // undefined
 *     console.log(stub.bind.called); // false
 *
 *     target.bind(null, 1, 2, 3); // fakeBoundTarget
 *     console.log(stub.bind.called); // true
 *
 * @param {function} fn
 * @param {mixed} args* `bind` arguments
 * - They do not have to exist, e.g. `obj` may be `{}` for convenience.
 * @return {object} Same as mixin.stubWithReturn
 */
mixin.stubBind = function stubBind(fn) {
  return this.stubWithReturn.call(this, {
    obj: fn,
    method: 'bind',
    args: [].slice.call(arguments, 1)
  });
};

// Adapters for automatic setup/teardown.
const adapters = {
  mocha: function mochaAdapter(sinon, disableAutoSandbox) {
    beforeEach(function mochaAdapterBeforeEach(done) {
      sinonDoublist(sinon, this, disableAutoSandbox);
      done();
    });

    afterEach(function mochaAdapterAfterEach(done) {
      this.sandbox.restore();
      done();
    });
  }
};

function sinonDoublistNoOp() {}
