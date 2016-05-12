/*global module, require, define*/
'use strict';
(function (global, factory) {

  // CommonJS (node) module
  if (typeof module === 'object' && module.exports) {
    return module.exports = factory(
      global
    );
  }

  // AMD module
  if (typeof define === 'function' && define.amd) {
    return define([], function () {
      return factory(global);
    });
  }

  // browser
  global.l33teral = factory(global);

}(this, function (global, undefined) {

  // use native otherwise polyfill
  var create = Object.create || (function () {
    var F = function () {};
    return function (o) {
      if (arguments.length > 1) { throw new Error('Second argument not supported');}
      if (o === null) { throw new Error('Cannot set a null [[Prototype]]');}
      if (typeof o !== 'object') { throw new TypeError('Argument must be an object');}
      F.prototype = o;
      return new F();
    };
  })();

  /**
   * GraphError constructor
   * @param operation
   * @param {String} message
   * @constructor
   */
  function GraphError(operation, message) {
    if (arguments.length === 1) {
      message = operation;
      operation = '';
    }
    Error.call(this, message);

    this.name = 'GraphError';
    this.operation = operation;
    Error.captureStackTrace(this, this.constructor);
  }

  GraphError.prototype = create(Error.prototype);
  GraphError.prototype.constructor = GraphError;

  var isNull = function (target) {
    return Object.prototype.toString.call(target) === '[object Null]';
  };

  var isUndefined = function (target) {
    return Object.prototype.toString.call(target) === '[object Undefined]';
  };
  
  var isArray = Array.isArray ? Array.isArray : function (target) {
    return Object.prototype.toString.call(target) === '[object Array]';
  };

  var isObject = function (target) {
    return Object.prototype.toString.call(target) === '[object Object]';
  };

  /**
   * L33teral constructor
   * @param {Object} obj
   * @constructor
   */
  function L33teral(obj) {
    this.__version__ = '{{VERSION}}';
    this.obj = obj || {};
  }

  /**
   * Traverses an object literal graph along `path` and returns
   * a value if `path` exists. If `defaultValue` is specified,
   * it will be returned if `path` does not exist. If it is not
   * specified, a `GraphError` will be thrown.
   * @param {String} path in the form of `foo.bar.baz`
   * @param {*} [defaultValue]
   * @return {*}
   * @throws {Error}
   */
  L33teral.prototype.tap = function (path, defaultValue) {
    var properties = path.split('.'),
      value = this.obj,
      index = -1,
      lastIndex = (properties.length - 1),
      useDefault = (arguments.length === 2);

    while (++index <= lastIndex) {
      if (!isNull(value) && value.hasOwnProperty(properties[index])) {
        value = value[properties[index]];
        continue;
      }

      if (useDefault) {
        return defaultValue;
      }

      var e = new GraphError('tap', 'graph detection failed');
      e.failedAt = properties.slice(0, index + 1).join('.');
      throw e;
    }

    if (isUndefined(value) && useDefault) {
      return defaultValue;
    }

    return value;
  };

  /**
   * Traverses an object literal along `path` and returns true
   * or false if the path exists.
   * @param {String} path in the form of `foo.bar.baz`
   * @return {Boolean}
   */
  L33teral.prototype.probe = function (path) {
    var properties = path.split('.'),
      value = this.obj,
      index = -1,
      lastIndex = properties.length - 1;

    while (++index <= lastIndex) {
      if (isNull(value)) {
        return false;
      }
      if (!value.hasOwnProperty(properties[index])) {
        return false;
      }
      value = value[properties[index]];
    }
    return true;
  };

  /**
   * Collects the values from multiple paths and puts them
   * into an array in the order of evaluation. Uses `tap`
   * to retrieve values. The `paths` parameter may be either
   * an arbitrary number of strings, an array of paths, or an
   * object literal where keys represent paths and values
   * represent default values for each path should the object
   * graph lack the specified path. If no default values are
   * specified (e.g., `paths` is an arbitrary number of String
   * parameters or an array), the value `undefined` will be
   * used as a default value for paths that cannot be found.
   * @param {...String|Array|Object} paths
   * @return {Array}
   */
  L33teral.prototype.collect = function (paths) {
    var self = this;
    var virginPaths = paths;
    var hasDefaults = false;

    if (isObject(paths) && !isArray(paths)) {
      paths = Object.keys(paths);
      hasDefaults = true;
    }
    if (!isArray(paths)) {
      paths = Array.prototype.slice.call(arguments, 0);
    }

    var collection = [];
    paths.forEach(function (path) {
      var defaultValue = (hasDefaults ? virginPaths[path] : undefined);
      try {
        /*
         * NOTE: not relying on the `defaultValue` behavior of
         * `tap` because we will use `undefined` as a default
         * value when one has not been supplied
         */
        collection.push(self.tap(path));
      } catch (e) {
        if (e instanceof GraphError) {
          return collection.push(defaultValue);
        }
        throw e;
      }
    });
    return collection;
  };

  /**
   * Collects the values from multiple paths and puts them into
   * an object literal where the keys are the paths and the values
   * are those found at each path in the original object literal.
   * If no default values are specified (e.g., `paths` is an arbitrary
   * number of String parameters or an array), the value `undefined`
   * will be used as a default value for paths that cannot be found.
   * @param {...String|Array|Object} paths
   */
  L33teral.prototype.extract = function (paths) {
    var values = this.collect.apply(this, arguments);

    if (isObject(paths) && !isArray(paths)) {
      paths = Object.keys(paths);
    }
    if (!isArray(paths)) {
      paths = Array.prototype.slice.call(arguments, 0);
    }

    var i = 0,
      length = paths.length,
      hash = {};

    for (i; i < length; i++) {
      hash[paths[i]] = values[i];
    }

    return hash;
  };

  /**
   * Counts the number of properties on the object
   */
  L33teral.prototype.length = function () {
    return Object.keys(this.obj).length;
  };

  /**
   * Determines if the object has all specified properties
   * @param {...String|Array} properties
   * @return {Boolean}
   */
  L33teral.prototype.hasAllProperties = function (properties) {
    var self = this;

    if (!isArray(properties)) {
      properties = Array.prototype.slice.call(arguments, 0);
    }

    return properties.every(function (property) {
      return self.obj.hasOwnProperty(property);
    });
  };

  /**
   * Determines if the object has any of the specified properties
   * @param {...String|Array} properties
   * @return {Boolean}
   */
  L33teral.prototype.hasAnyProperties = function (properties) {
    var self = this;

    if (!isArray(properties)) {
      properties = Array.prototype.slice.call(arguments, 0);
    }

    return properties.some(function (property) {
      return self.obj.hasOwnProperty(property);
    });
  };

  /**
   * Determines if the object has all of the specified paths
   * @param {...String|Array} paths
   * @return {Boolean}
   */
  L33teral.prototype.probeAll = function (paths) {
    var self = this;

    if (!isArray(paths)) {
      paths = Array.prototype.slice.call(arguments, 0);
    }

    return paths.every(function (path) {
      return self.probe(path);
    });
  };

  /**
   * Determines if the object has any of the specified paths
   * @param {...String|Array} paths
   * @return {*}
   */
  L33teral.prototype.probeAny = function (paths) {
    var self = this;

    if (!isArray(paths)) {
      paths = Array.prototype.slice.call(arguments, 0);
    }

    return paths.some(function (path) {
      return self.probe(path);
    });
  };

  /**
   * Determines if the object has the path(s) specified, and if the
   * value at path(s) is truthy.
   * @param {...String|Array} paths
   * @return {Boolean}
   */
  L33teral.prototype.truthy = function (paths) {
    var self = this;

    if (!isArray(paths)) {
      paths = Array.prototype.slice.call(arguments, 0);
    }

    return paths.every(function (path) {
      return self.probe(path) && !!self.tap(path);
    });
  };

  /**
   * Plants a value at a path, creating the graph if it does not exist. All
   * segments in the path are treated as object properties.
   * @param {String} path
   * @param {*} value
   * @return
   */
  L33teral.prototype.plant = function (path, value) {
    if (!path) {
      return;
    }

    var current = this.obj,
      segments = path.split('.'),
      position = 0,
      length = segments.length,
      segment;

    var isMore = function () {
      return position < length;
    };

    var isLast = function () {
      return position === (length - 1);
    };

    while (isMore()) {
      segment = segments[position];
      if (!current.hasOwnProperty(segment) || isNull(current[segment])) {
        current[segment] = {};
      }
      if (isLast()) {
        current[segment] = value;
      }
      current = current[segment];
      position += 1;
    }
  };

  /**
   * Deletes the key at the end of an object path.
   * @param {String} path
   * @param {Boolean} [suppressError] - prevent a {GraphError} from being thrown if
   * any part of the path cannot be fully resolved
   * @throws {GraphError}
   */
  L33teral.prototype.snip = function (path, suppressError) {
    if (!path) {
      return;
    }

    var current = this.obj,
      segments = path.split('.'),
      position = 0,
      length = segments.length,
      segment;

    var isMore = function () {
      return position < length;
    };

    var isLast = function () {
      return position === (length - 1);
    };

    while (isMore()) {
      segment = segments[position];
      if (isNull(current) || !current.hasOwnProperty(segment)) {
        if (suppressError) {
          return;
        }
        var e = new GraphError('snip', 'graph detection failed');
        e.failedAt = segments.slice(0, position + 1).join('.');
        throw e;
      }
      if (isLast()) {
        delete current[segment];
      }
      current = current[segment];
      position += 1;
    }
  };

  /**
   * Deletes the key at the end of an object path (like `snip`), and all keys
   * along the path in reverse if they resolve to empty objects, e.g.: given
   * the literal `{foo: {stop:1, bar: {baz: {} } } }`, baz and bar would be
   * deleted given the path `foo.bar.baz`, but foo would remain with the
   * property `stop` because foo is not "empty" (still has keys).
   * @param {String} path
   * @param {Boolean} [suppressError] - prevent a {GraphError} from being thrown if
   * any part of the path cannot be fully resolved
   * @throws {GraphError}
   */
  L33teral.prototype.purge = function (path, suppressError) {
    if (!path) {
      return;
    }

    var current = this.obj,
      segments = path.split('.'),
      position = 0,
      length = segments.length,
      segment;

    var isMore = function () {
      return position < length;
    };

    var isLast = function () {
      return position === (length - 1);
    };

    while (isMore()) {
      segment = segments[position];
      if (isNull(current) || !current.hasOwnProperty(segment)) {
        if (suppressError) {
          return;
        }
        var e = new GraphError('snip', 'graph detection failed');
        e.failedAt = segments.slice(0, position + 1).join('.');
        throw e;
      }
      if (isLast()) {
        delete current[segment];
        if (Object.getOwnPropertyNames(current).length === 0) {
          segments.pop();
          path = segments.join('.');
          return this.purge(path, suppressError);
        }
      }
      current = current[segment];
      position += 1;
    }
  };

  var exports = function (literal) {
    return new L33teral(literal);
  };

  exports.GraphError = GraphError;

  return exports;

}));
