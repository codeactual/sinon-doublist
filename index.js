/**
 * Sinon.JS test double mixins.
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

module.exports = function(sinon, test, disableAutoSandbox) {
  Object.keys(mixin).forEach(function(method) {
    test[method] = bind(test, mixin[method]);
  });
  if (!disableAutoSandbox) {
    test._createSandbox(sinon);
  }
};

var is = require('is');
var bind = require('bind');
var goodwin = require('goodwin');
var setPathValue = goodwin.setPathValue;
var getPathValue = goodwin.getPathValue;
var mixin = {};

mixin._createSandbox = function(sinon) {
  var self = this;
  this.sandbox = sinon.sandbox.create();
  this.spy = bind(self.sandbox, this.sandbox.spy);
  this.stub = bind(self.sandbox, this.sandbox.stub);
  this.mock = bind(self.sandbox, this.sandbox.mock);
  this.clock = this.sandbox.useFakeTimers();
  this.server = this.sandbox.useFakeServer();
  this.requests = this.sandbox.useFakeXMLHttpRequest();
};

mixin.restoreSandbox = function() {
  this.sandbox.restore();
};

/**
 * _doubleMany() wrapper configured for 'spy' type.
 *
 * @param {object} obj Double target object.
 * @param {string|array} methods One or more method names/namespaces.
 *   They do not have to exist, e.g. 'obj' and be {} for convenience.
 * @return {object} Stub(s) indexed by method name.
 */
mixin.spyMany = function(obj, methods) {
  // Use call() to propagate the context bound in beforeEach().
  return mixin._doubleMany.call(this, 'spy', obj, methods);
};

/**
 * _doubleMany() wrapper configured for 'stub' type.
 *
 * @param {object} obj Double target object.
 * @param {string|array} methods One or more method names/namespaces.
 *   They do not have to exist, e.g. 'obj' and be {} for convenience.
 * @return {object} Stub(s) indexed by method name.
 */
mixin.stubMany = function(obj, methods) {
  // Use call() to propagate the context bound in beforeEach().
  return mixin._doubleMany.call(this, 'stub', obj, methods);
};

/**
 * withArgs()/returns() convenience wrapper.
 *
 * Example use case: SUT is that lib function foo() calls bar()
 * with expected arguments. But one of the arguments to bar()
 * is the return value of baz(). Use this helper to stub baz()
 * out of the picture, to focus on the foo() and bar() relationship.
 *
 * A baz() example is _.bind().
 *
 * @param {object} config
 *   Required:
 *
 *   {string} method` Stub target method name, ex. 'bind'
 *
 *   Optional:
 *
 *   {object} obj Stub target object, ex. underscore.
 *   {array} args Arguments 'method' expects to receive.
 *   {string|array} spies Stub will return an object with spies given these names.
 *     An alternative to setting an explicit returns.
 *   {mixed} returns Stub returns this value.
 *     An alternative to setting  spies.
 * @return {object}
 *   {function} returnedSpy or {object} returnedSpies Depends on whether spies is a string or array.
 *   {function} <method> The created stub. The property name will match the configured method name.
 *   {object} target Input obj, or {} if 'obj' was null.
 * @throws Error If method not specified.
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
    stub = this.stub(config.obj, config.method);
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
      setPathValue(config.spies, this.spy(), returns);
    } else {
      var spies = [].concat(config.spies);
      for (var s = 0; s < spies.length; s++) {
        returns[spies[s]] = self.spy();
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
 * @param {object} obj Double target object.
 * @param {string|array} methods One or more method names/namespaces.
 *   They do not have to exist, e.g. 'obj' and be {} for convenience.
 * @return {object} Stub(s) indexed by method name.
 */
mixin._doubleMany = function(type, obj, methods) {
  var self = this;
  var doubles = {};
  methods = [].concat(methods);

  for (var m = 0; m < methods.length; m++) {
    var method = methods[m];

    // Sinon requires doubling target to exist.
    if (!getPathValue(method, obj)) {
      setPathValue(method, sinonDoublistNoOp, obj);
    }

    if (/\./.test(method)) { // Ex. 'a.b.c'
      var lastNsPart = method.split('.').slice(-1);  // Ex. 'c'
      doubles[method] = self[type](
        getPathValue(method.split('.').slice(0, -1).join('.'), obj), // Ex. 'a.b'
        method.split('.').slice(-1)  // Ex. 'c'
      );
    } else {
      doubles[method] = self[type](obj, method);
    }
  }

  return doubles;
};

function sinonDoublistNoOp() {}
