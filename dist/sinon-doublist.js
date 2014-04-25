
;(function(){

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("manuelstofer~each@master", function (exports, module) {
"use strict";

var nativeForEach = [].forEach;

// Underscore's each function
module.exports = function (obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
    } else {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === {}) return;
            }
        }
    }
};

});

require.register("codeactual~is@0.1.2", function (exports, module) {
/*jshint node:true*/
"use strict";

var each = require("manuelstofer~each@master");
var types = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Array'];

each(types, function (type) {
  var method = type === 'Function' ? type : type.toLowerCase();
  module.exports[method] = function (obj) {
    return Object.prototype.toString.call(obj) === '[object ' + type + ']';
  };
});

if (Array.isArray) {
  module.exports.array = Array.isArray;
}

module.exports.object = function (obj) {
  return obj === Object(obj);
};


});

require.register("component~bind@9a55368", function (exports, module) {

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});

require.register("qualiancy~tea-properties@0.1.0", function (exports, module) {
/*!
 * goodwin - deep object get/set path values
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 *
 * @website https://github.com/logicalparadox/goodwin/'
 * @issues https://github.com/logicalparadox/goodwin/issues'
 */

/*!
 * Primary exports
 */

var exports = module.exports = {};

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

exports.get = function (obj, path) {
  var parsed = parsePath(path);
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

exports.set = function (obj, path, val) {
  var parsed = parsePath(path);
  setPathValue(parsed, val, obj);
};

function defined (val) {
  return 'undefined' === typeof val;
}

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

function parsePath (path) {
  var str = path.replace(/\[/g, '.[')
    , parts = str.match(/(\\\.|[^.]+?)+/g);

  return parts.map(function (value) {
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

function getPathValue (parsed, obj) {
  var tmp = obj
    , res;

  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if (!defined(part.p)) tmp = tmp[part.p];
      else if (!defined(part.i)) tmp = tmp[part.i];
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

function setPathValue (parsed, val, obj) {
  var tmp = obj;

  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if (!defined(tmp)) {
      if (i == (l - 1)) {
        if (!defined(part.p)) tmp[part.p] = val;
        else if (!defined(part.i)) tmp[part.i] = val;
      } else {
        if (!defined(part.p) && tmp[part.p]) tmp = tmp[part.p];
        else if (!defined(part.i) && tmp[part.i]) tmp = tmp[part.i];
        else {
          var next = parsed[i + 1];
          if (!defined(part.p)) {
            tmp[part.p] = {};
            tmp = tmp[part.p];
          } else if (!defined(part.i)) {
            tmp[part.i] = [];
            tmp = tmp[part.i]
          }
        }
      }
    } else {
      if (i == (l - 1)) tmp = val;
      else if (!defined(part.p)) tmp = {};
      else if (!defined(part.i)) tmp = [];
    }
  }
};

});

require.register("sinon-doublist", function (exports, module) {
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

var is = require("codeactual~is@0.1.2");
var bind = require("component~bind@9a55368");
var properties = require("qualiancy~tea-properties@0.1.0");
var setPathValue = properties.set;
var getPathValue = properties.get;
var mixin = {};
var browserEnv = typeof window === 'object';

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

});

if (typeof exports == "object") {
  module.exports = require("sinon-doublist");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("sinon-doublist"); });
} else {
  this["sinonDoublist"] = require("sinon-doublist");
}
})()
