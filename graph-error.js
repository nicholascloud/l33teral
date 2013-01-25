'use strict';

function GraphError(message) {
  Error.apply(this, arguments);
  this.name = 'GraphError';
  this.message = message;
}

GraphError.prototype = new Error();
GraphError.prototype.constructor = GraphError;

module.exports = GraphError;