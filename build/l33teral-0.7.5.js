/**
 * l33teral 0.7.5
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Nicholas Cloud
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
/*global module, require, define*/
'use strict';
(function (global, factory) {

  // CommonJS (node) module
  if (typeof module === 'object' && module.exports) {
    return module.exports = factory(
      require('underscore'),
      global
    );
  }

  // AMD module
  if (typeof define === 'function' && define.amd) {
    return define(['underscore'], function (_) {
      return factory(_, global);
    });
  }

  // browser
  global.l33teral = factory(global._, global);

}(this, function (_, global, undefined) {

  /**
   * GraphError constructor
   * @param {String} message
   * @constructor
   */
  function GraphError(message) {
    Error.apply(this, arguments);
    this.name = 'GraphError';
    this.message = message;
  }

  GraphError.prototype = new Error();
  GraphError.prototype.constructor = GraphError;

  /**
   * L33teral constructor
   * @param {Object} obj
   * @constructor
   */
  function L33teral(obj) {
    this.__version__ = '0.7.5';
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
      if (value.hasOwnProperty(properties[index])) {
        value = value[properties[index]];
        continue;
      }

      if (useDefault) {
        return defaultValue;
      }

      var e = new GraphError('graph detection failed');
      e.failedAt = properties.slice(0, index + 1).join('.');
      throw e;
    }

    if (_.isUndefined(value) && useDefault) {
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

    if (_.isObject(paths) && !_.isArray(paths)) {
      paths = Object.keys(paths);
      hasDefaults = true;
    }
    if (!_.isArray(paths)) {
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

    if (_.isObject(paths) && !_.isArray(paths)) {
      paths = Object.keys(paths);
    }
    if (!_.isArray(paths)) {
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

    if (!_.isArray(properties)) {
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

    if (!_.isArray(properties)) {
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

    if (!_.isArray(paths)) {
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

    if (!_.isArray(paths)) {
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

    if (!_.isArray(paths)) {
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

    function isMore() {
      return position < length;
    }

    function isLast() {
      return position === (length - 1);
    }

    while (isMore()) {
      segment = segments[position];
      if (!current.hasOwnProperty(segment)) {
        current[segment] = {};
      }
      if (isLast()) {
        current[segment] = value;
      }
      current = current[segment];
      position += 1;
    }
  };

  return function (literal) {
    return new L33teral(literal);
  };

}));