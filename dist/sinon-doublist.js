(function() {
    function require(name) {
        var module = require.modules[name];
        if (!module) throw new Error('failed to require "' + name + '"');
        if (!("exports" in module) && typeof module.definition === "function") {
            module.client = module.component = true;
            module.definition.call(this, module.exports = {}, module);
            delete module.definition;
        }
        return module.exports;
    }
    require.modules = {};
    require.register = function(name, definition) {
        require.modules[name] = {
            definition: definition
        };
    };
    require.define = function(name, exports) {
        require.modules[name] = {
            exports: exports
        };
    };
    require.register("manuelstofer~each@master", function(exports, module) {
        "use strict";
        var nativeForEach = [].forEach;
        module.exports = function(obj, iterator, context) {
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
    require.register("codeactual~is@0.1.2", function(exports, module) {
        "use strict";
        var each = require("manuelstofer~each@master");
        var types = [ "Arguments", "Function", "String", "Number", "Date", "RegExp", "Array" ];
        each(types, function(type) {
            var method = type === "Function" ? type : type.toLowerCase();
            module.exports[method] = function(obj) {
                return Object.prototype.toString.call(obj) === "[object " + type + "]";
            };
        });
        if (Array.isArray) {
            module.exports.array = Array.isArray;
        }
        module.exports.object = function(obj) {
            return obj === Object(obj);
        };
    });
    require.register("component~bind@9a55368", function(exports, module) {
        var slice = [].slice;
        module.exports = function(obj, fn) {
            if ("string" == typeof fn) fn = obj[fn];
            if ("function" != typeof fn) throw new Error("bind() requires a function");
            var args = [].slice.call(arguments, 2);
            return function() {
                return fn.apply(obj, args.concat(slice.call(arguments)));
            };
        };
    });
    require.register("qualiancy~tea-properties@0.1.0", function(exports, module) {
        var exports = module.exports = {};
        exports.get = function(obj, path) {
            var parsed = parsePath(path);
            return getPathValue(parsed, obj);
        };
        exports.set = function(obj, path, val) {
            var parsed = parsePath(path);
            setPathValue(parsed, val, obj);
        };
        function defined(val) {
            return "undefined" === typeof val;
        }
        function parsePath(path) {
            var str = path.replace(/\[/g, ".["), parts = str.match(/(\\\.|[^.]+?)+/g);
            return parts.map(function(value) {
                var re = /\[(\d+)\]$/, mArr = re.exec(value);
                if (mArr) return {
                    i: parseFloat(mArr[1])
                }; else return {
                    p: value
                };
            });
        }
        function getPathValue(parsed, obj) {
            var tmp = obj, res;
            for (var i = 0, l = parsed.length; i < l; i++) {
                var part = parsed[i];
                if (tmp) {
                    if (!defined(part.p)) tmp = tmp[part.p]; else if (!defined(part.i)) tmp = tmp[part.i];
                    if (i == l - 1) res = tmp;
                } else {
                    res = undefined;
                }
            }
            return res;
        }
        function setPathValue(parsed, val, obj) {
            var tmp = obj;
            for (var i = 0, l = parsed.length; i < l; i++) {
                var part = parsed[i];
                if (!defined(tmp)) {
                    if (i == l - 1) {
                        if (!defined(part.p)) tmp[part.p] = val; else if (!defined(part.i)) tmp[part.i] = val;
                    } else {
                        if (!defined(part.p) && tmp[part.p]) tmp = tmp[part.p]; else if (!defined(part.i) && tmp[part.i]) tmp = tmp[part.i]; else {
                            var next = parsed[i + 1];
                            if (!defined(part.p)) {
                                tmp[part.p] = {};
                                tmp = tmp[part.p];
                            } else if (!defined(part.i)) {
                                tmp[part.i] = [];
                                tmp = tmp[part.i];
                            }
                        }
                    }
                } else {
                    if (i == l - 1) tmp = val; else if (!defined(part.p)) tmp = {}; else if (!defined(part.i)) tmp = [];
                }
            }
        }
    });
    require.register("sinon-doublist", function(exports, module) {
        "use strict";
        var browserEnv = typeof window === "object";
        module.exports = sinonDoublist;
        function sinonDoublist(sinon, test, disableAutoSandbox) {
            if (typeof test === "string") {
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
        var browserEnv = typeof window === "object";
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
        mixin.spyMany = function(obj, methods) {
            return this.doubleMany.call(this, "spy", obj, methods);
        };
        mixin.stubMany = function(obj, methods) {
            return this.doubleMany.call(this, "stub", obj, methods);
        };
        mixin.stubWithReturn = function(config) {
            config = config || {};
            var self = this;
            var stub;
            var returns;
            var isReturnsConfigured = config.hasOwnProperty("returns");
            var payload = {};
            if (!is.string(config.method) || !config.method.length) {
                throw new Error("method not specified");
            }
            if (config.obj) {
                stub = this.stubMany(config.obj, config.method)[config.method];
            } else {
                config.obj = {};
                stub = this.stubMany(config.obj, config.method)[config.method];
            }
            if (is.array(config.args) && config.args.length) {
                stub = stub.withArgs.apply(stub, config.args);
            }
            if (config.spies) {
                returns = {};
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
        mixin.doubleMany = function(type, obj, methods) {
            var self = this;
            var doubles = {};
            methods = [].concat(methods);
            for (var m = 0; m < methods.length; m++) {
                var method = methods[m];
                if (!getPathValue(obj, method)) {
                    setPathValue(obj, method, sinonDoublistNoOp);
                }
                if (/\./.test(method)) {
                    var lastNsPart = method.split(".").slice(-1);
                    doubles[method] = self[type](getPathValue(obj, method.split(".").slice(0, -1).join(".")), method.split(".").slice(-1));
                } else {
                    doubles[method] = self[type](obj, method);
                }
            }
            return doubles;
        };
        mixin.stubBind = function(fn) {
            return this.stubWithReturn.call(this, {
                obj: fn,
                method: "bind",
                args: [].slice.call(arguments, 1)
            });
        };
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
        define([], function() {
            return require("sinon-doublist");
        });
    } else {
        this["sinon-doublist"] = require("sinon-doublist");
    }
})();