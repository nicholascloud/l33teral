/*global describe, it*/
'use strict';
var mocha = require('mocha'),
  assert = require('chai').assert,
  GraphError = require('../graph-error');

describe('GraphError', function () {

  describe('instanceof', function () {
    it('should be an instance of `GraphError`', function (done) {
      var e = new GraphError(null);
      assert.isTrue(e instanceof GraphError);
      done();
    });
  });

  describe('#name', function () {
    it('should be `GraphError`', function (done) {
      var e = new GraphError(null);
      assert.equal(e.name, 'GraphError');
      done();
    });
  });

  describe('#message', function () {
    it('should equal constructor argument', function (done) {
      var expected = 'message';
      var e = new GraphError(expected);
      assert.equal(e.message, expected);
      done();
    });
  });
});