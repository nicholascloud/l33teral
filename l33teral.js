'use strict';
var _ = require('underscore'),
  GraphError = require('./graph-error');

/**
 * L33teral constructor
 * @param {Object} obj
 * @constructor
 */
function L33teral(obj) {
  this.obj = obj;
}

/**
 * Traverses an object literal graph along `path` and returns
 * a value if `path` exists. If `defaultValue` is specified,
 * it will be returned if `path` does not exist. If it is not
 * specified, a `GraphError` will be thrown.
 * @param {String} path in the form of `foo.bar.baz`
 * @param {*} [defaultValue]
 * @return {*}
 * @throws {GraphError}
 */
L33teral.prototype.tap = function (path, defaultValue) {
  var properties = path.split('.'),
    value = this.obj,
    index = -1,
    lastIndex = properties.length - 1;

  while (++index <= lastIndex) {
    if (value.hasOwnProperty(properties[index])) {
      value = value[properties[index]];
      continue;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    var e = new GraphError('graph detection failed');
    e.failedAt = properties.slice(0, index + 1).join('.');
    throw e;
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
 * Determines if the object has all of the specified graphs;
 * uses `probe` to resolve graphs.
 * @param {...String|Array} paths
 * @return {Boolean}
 */
L33teral.prototype.hasAllGraphs = function (paths) {
  var self = this;

  if (!_.isArray(paths)) {
    paths = Array.prototype.slice.call(arguments, 0);
  }

  return paths.every(function (path) {
    return self.probe(path);
  });
};

/**
 * Determines if the object has any of the specified graphs;
 * uses `probe` to resolve graphs.
 * @param {...String|Array} paths
 * @return {*}
 */
L33teral.prototype.hasAnyGraphs = function (paths) {
  var self = this;

  if (!_.isArray(paths)) {
    paths = Array.prototype.slice.call(arguments, 0);
  }

  return paths.some(function (path) {
    return self.probe(path);
  });
};

module.exports = L33teral;