(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sinonDoublist = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"is":2,"pathval":3}],2:[function(require,module,exports){

/**!
 * is
 * the definitive JavaScript type testing library
 *
 * @copyright 2013-2014 Enrico Marino / Jordan Harband
 * @license MIT
 */

var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toStr = objProto.toString;
var symbolValueOf;
if (typeof Symbol === 'function') {
  symbolValueOf = Symbol.prototype.valueOf;
}
var isActualNaN = function (value) {
  return value !== value;
};
var NON_HOST_TYPES = {
  boolean: 1,
  number: 1,
  string: 1,
  undefined: 1
};

var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
var hexRegex = /^[A-Fa-f0-9]+$/;

/**
 * Expose `is`
 */

var is = module.exports = {};

/**
 * Test general.
 */

/**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {Mixed} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */

is.a = is.type = function (value, type) {
  return typeof value === type;
};

/**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */

is.defined = function (value) {
  return typeof value !== 'undefined';
};

/**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */

is.empty = function (value) {
  var type = toStr.call(value);
  var key;

  if ('[object Array]' === type || '[object Arguments]' === type || '[object String]' === type) {
    return value.length === 0;
  }

  if ('[object Object]' === type) {
    for (key in value) {
      if (owns.call(value, key)) { return false; }
    }
    return true;
  }

  return !value;
};

/**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {Mixed} value value to test
 * @param {Mixed} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */

is.equal = function (value, other) {
  var strictlyEqual = value === other;
  if (strictlyEqual) {
    return true;
  }

  var type = toStr.call(value);
  var key;

  if (type !== toStr.call(other)) {
    return false;
  }

  if ('[object Object]' === type) {
    for (key in value) {
      if (!is.equal(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (key in other) {
      if (!is.equal(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }

  if ('[object Array]' === type) {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (--key) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if ('[object Function]' === type) {
    return value.prototype === other.prototype;
  }

  if ('[object Date]' === type) {
    return value.getTime() === other.getTime();
  }

  return strictlyEqual;
};

/**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {Mixed} value to test
 * @param {Mixed} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */

is.hosted = function (value, host) {
  var type = typeof host[value];
  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */

is.instance = is['instanceof'] = function (value, constructor) {
  return value instanceof constructor;
};

/**
 * is.nil / is.null
 * Test if `value` is null.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */

is.nil = is['null'] = function (value) {
  return value === null;
};

/**
 * is.undef / is.undefined
 * Test if `value` is undefined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */

is.undef = is.undefined = function (value) {
  return typeof value === 'undefined';
};

/**
 * Test arguments.
 */

/**
 * is.args
 * Test if `value` is an arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.args = is.arguments = function (value) {
  var isStandardArguments = '[object Arguments]' === toStr.call(value);
  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
  return isStandardArguments || isOldArguments;
};

/**
 * Test array.
 */

/**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */

is.array = function (value) {
  return '[object Array]' === toStr.call(value);
};

/**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
is.args.empty = function (value) {
  return is.args(value) && value.length === 0;
};

/**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
is.array.empty = function (value) {
  return is.array(value) && value.length === 0;
};

/**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arraylike = function (value) {
  return !!value && !is.boolean(value)
    && owns.call(value, 'length')
    && isFinite(value.length)
    && is.number(value.length)
    && value.length >= 0;
};

/**
 * Test boolean.
 */

/**
 * is.boolean
 * Test if `value` is a boolean.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */

is.boolean = function (value) {
  return '[object Boolean]' === toStr.call(value);
};

/**
 * is.false
 * Test if `value` is false.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */

is['false'] = function (value) {
  return is.boolean(value) && Boolean(Number(value)) === false;
};

/**
 * is.true
 * Test if `value` is true.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */

is['true'] = function (value) {
  return is.boolean(value) && Boolean(Number(value)) === true;
};

/**
 * Test date.
 */

/**
 * is.date
 * Test if `value` is a date.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */

is.date = function (value) {
  return '[object Date]' === toStr.call(value);
};

/**
 * Test element.
 */

/**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */

is.element = function (value) {
  return value !== undefined
    && typeof HTMLElement !== 'undefined'
    && value instanceof HTMLElement
    && value.nodeType === 1;
};

/**
 * Test error.
 */

/**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */

is.error = function (value) {
  return '[object Error]' === toStr.call(value);
};

/**
 * Test function.
 */

/**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */

is.fn = is['function'] = function (value) {
  var isAlert = typeof window !== 'undefined' && value === window.alert;
  return isAlert || '[object Function]' === toStr.call(value);
};

/**
 * Test number.
 */

/**
 * is.number
 * Test if `value` is a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */

is.number = function (value) {
  return '[object Number]' === toStr.call(value);
};

/**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
is.infinite = function (value) {
  return value === Infinity || value === -Infinity;
};

/**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */

is.decimal = function (value) {
  return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0;
};

/**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */

is.divisibleBy = function (value, n) {
  var isDividendInfinite = is.infinite(value);
  var isDivisorInfinite = is.infinite(n);
  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};

/**
 * is.int
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */

is.int = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};

/**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */

is.maximum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value < others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */

is.minimum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value > others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */

is.nan = function (value) {
  return !is.number(value) || value !== value;
};

/**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */

is.even = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};

/**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */

is.odd = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};

/**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.ge = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value >= other;
};

/**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.gt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value > other;
};

/**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */

is.le = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value <= other;
};

/**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */

is.lt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value < other;
};

/**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
is.within = function (value, start, finish) {
  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
    throw new TypeError('all arguments must be numbers');
  }
  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
  return isAnyInfinite || (value >= start && value <= finish);
};

/**
 * Test object.
 */

/**
 * is.object
 * Test if `value` is an object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */

is.object = function (value) {
  return '[object Object]' === toStr.call(value);
};

/**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */

is.hash = function (value) {
  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

/**
 * Test regexp.
 */

/**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */

is.regexp = function (value) {
  return '[object RegExp]' === toStr.call(value);
};

/**
 * Test string.
 */

/**
 * is.string
 * Test if `value` is a string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */

is.string = function (value) {
  return '[object String]' === toStr.call(value);
};

/**
 * Test base64 string.
 */

/**
 * is.base64
 * Test if `value` is a valid base64 encoded string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a base64 encoded string, false otherwise
 * @api public
 */

is.base64 = function (value) {
  return is.string(value) && (!value.length || base64Regex.test(value));
};

/**
 * Test base64 string.
 */

/**
 * is.hex
 * Test if `value` is a valid hex encoded string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a hex encoded string, false otherwise
 * @api public
 */

is.hex = function (value) {
  return is.string(value) && (!value.length || hexRegex.test(value));
};

/**
 * is.symbol
 * Test if `value` is an ES6 Symbol
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a Symbol, false otherise
 * @api public
 */

is.symbol = function (value) {
  return typeof Symbol === 'function' && toStr.call(value) === '[object Symbol]' && typeof symbolValueOf.call(value) === 'symbol';
};

},{}],3:[function(require,module,exports){
/**
 * ### .get(obj, path)
 *
 * Retrieve the value in an object given a string path.
 *
 * ```js
 * var obj = {
 *     prop1: {
 *         arr: ['a', 'b', 'c']
 *       , str: 'Hello'
 *     }
 *   , prop2: {
 *         arr: [ { nested: 'Universe' } ]
 *       , str: 'Hello again!'
 *     }
 * };
 * ```
 *
 * The following would be the results.
 *
 * ```js
 * var properties = require('tea-properties');
 * properties.get(obj, 'prop1.str'); // Hello
 * properties.get(obj, 'prop1.att[2]'); // b
 * properties.get(obj, 'prop2.arr[0].nested'); // Universe
 * ```
 *
 * @param {Object} object
 * @param {String} path
 * @return {Object} value or `undefined`
 */

exports.get = function(obj, path) {
  var parsed = exports.parse(path);
  return getPathValue(parsed, obj);
};

/**
 * ### .set(path, value, object)
 *
 * Define the value in an object at a given string path.
 *
 * ```js
 * var obj = {
 *     prop1: {
 *         arr: ['a', 'b', 'c']
 *       , str: 'Hello'
 *     }
 *   , prop2: {
 *         arr: [ { nested: 'Universe' } ]
 *       , str: 'Hello again!'
 *     }
 * };
 * ```
 *
 * The following would be acceptable.
 *
 * ```js
 * var properties = require('tea-properties');
 * properties.set(obj, 'prop1.str', 'Hello Universe!');
 * properties.set(obj, 'prop1.arr[2]', 'B');
 * properties.set(obj, 'prop2.arr[0].nested.value', { hello: 'universe' });
 * ```
 *
 * @param {Object} object
 * @param {String} path
 * @param {Mixed} value
 * @api public
 */

exports.set = function(obj, path, val) {
  var parsed = exports.parse(path);
  setPathValue(parsed, val, obj);
};

/*!
 * Helper function used to parse string object
 * paths. Use in conjunction with `getPathValue`.
 *
 *  var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 *
 * @param {String} path
 * @returns {Object} parsed
 */

exports.parse = function(path) {
  var str = (path || '').replace(/\[/g, '.[');
  var parts = str.match(/(\\\.|[^.]+?)+/g);

  return parts.map(function(value) {
    var re = /\[(\d+)\]$/
      , mArr = re.exec(value)
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value };
  });
};

/*!
 * Companion function for `parsePath` that returns
 * the value located at the parsed address.
 *
 *  var value = getPathValue(parsed, obj);
 *
 * @param {Object} parsed definition from `parsePath`.
 * @param {Object} object to search against
 * @returns {Object|Undefined} value
 */

function getPathValue(parsed, obj) {
  var tmp = obj;
  var res;

  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if (defined(part.p)) tmp = tmp[part.p];
      else if (defined(part.i)) tmp = tmp[part.i];
      if (i == (l - 1)) res = tmp;
    } else {
      res = undefined;
    }
  }

  return res;
};

/*!
 * Companion function for `parsePath` that sets
 * the value located at a parsed address.
 *
 *  setPathValue(parsed, 'value', obj);
 *
 * @param {Object} parsed definition from `parsePath`
 * @param {*} value to use upon set
 * @param {Object} object to search and define on
 * @api private
 */

function setPathValue(parsed, val, obj) {
  var tmp = obj;
  var i = 0;
  var l = parsed.length;
  var part;

  for (; i < l; i++) {
    part = parsed[i];

    if (defined(tmp) && i == (l - 1)) {
      var x = defined(part.p) ? part.p : part.i;
      tmp[x] = val;
    } else if (defined(tmp)) {
      if (defined(part.p) && tmp[part.p]) {
        tmp = tmp[part.p];
      } else if (defined(part.i) && tmp[part.i]) {
        tmp = tmp[part.i];
      } else {
        var next = parsed[i + 1];
        var x = defined(part.p) ? part.p : part.i;
        var y = defined(next.p) ? {} : [];
        tmp[x] = y;
        tmp = tmp[x];
      }
    } else {
      if (i == (l - 1)) tmp = val;
      else if (defined(part.p)) tmp = {};
      else if (defined(part.i)) tmp = [];
    }
  }
};

/*!
 * Check if `val` is defined.
 *
 * @param {Mixed} val
 * @returns {Boolean} `true` if defined
 * @api private
 */

function defined(val) {
  return !(!val && 'undefined' === typeof val);
}

},{}]},{},[1])(1)
});