/**
 * Sinon.JS test double mixins.
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
/*global beforeEach:false, afterEach:false, window: false*/
'use strict';

var browserEnv = typeof window === 'object';

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

  Object.keys(mixin).forEach(function(method) {
    test[method] = bind(test, mixin[method]);
  });
  if (!disableAutoSandbox) {
    test.createSandbox(sinon);
  }
}

var is = require('is');
var bind = require('bind');
var properties = require('tea-properties');
var setPathValue = properties.set;
var getPathValue = properties.get;
var mixin = {};
var browserEnv = typeof window === 'object';

/**
 * Init sandbox and add its properties to the current context.
 *
 * To restore: `this.sandbox.restore()`
 *
 * @param {object} sinon
 */
mixin.createSandbox = function(sinon) {
  var self = this;
  this.sandbox = sinon.sandbox.create();
  this.spy = bind(self.sandbox, this.sandbox.spy);
  this.stub = bind(self.sandbox, this.sandbox.stub);
  this.mock = bind(self.sandbox, this.sandbox.mock);
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
mixin.spyMany = function(obj, methods) {
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
mixin.stubMany = function(obj, methods) {
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
mixin.stubWithReturn = function(config) {
  config = config || {};

  var self = this;
  var stub;
  var returns;
  var isReturnsConfigured = config.hasOwnProperty('returns');
  var payload = {};

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
      var spies = [].concat(config.spies);
      for (var s = 0; s < spies.length; s++) {
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
    if (is.Function(returns)) {
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
mixin.doubleMany = function(type, obj, methods) {
  var self = this;
  var doubles = {};
  methods = [].concat(methods);

  for (var m = 0; m < methods.length; m++) {
    var method = methods[m];

    // Sinon requires doubling target to exist.
    if (!getPathValue(obj, method)) {
      setPathValue(obj, method, sinonDoublistNoOp);
    }

    if (/\./.test(method)) { // Ex. 'a.b.c'
      var lastNsPart = method.split('.').slice(-1);  // Ex. 'c'
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
 *     var stub = this.stubBind(target, null, 1, 2, 3).bind;
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
mixin.stubBind = function(fn) {
  return this.stubWithReturn.call(this, {
    obj: fn,
    method: 'bind',
    args: [].slice.call(arguments, 1)
  });
};

// Adapters for automatic setup/teardown.
var adapters = {
  mocha: function(sinon, disableAutoSandbox) {
    beforeEach(function(done) {
      sinonDoublist(sinon, this, disableAutoSandbox);
      done();
    });

    afterEach(function(done) {
      this.sandbox.restore();
      done();
    });
  }
};

function sinonDoublistNoOp() {}
