/*global describe, it*/
'use strict';
var mocha = require('mocha'),
  assert = require('chai').assert,
  leet = require('../l33teral'),
  GraphError = require('../graph-error'),
  mockObject = require('./mock-object');

describe('L33teral', function () {

  describe('#obj', function () {
    it('should be equal to the constructor argument', function (done) {
      var expected = mockObject();
      var leetMock = leet(expected);
      assert.equal(leetMock.obj, expected);
      done();
    });
  });

  describe('#tap()', function () {
    it('should throw if the graph is not present and no default value is provided', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      assert.throw(function () {
        leetMock.tap('address.missing');
      }, GraphError);

      done();
    });

    it('should return the default value if no graph is present and the default value is provided', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var expected = '646';
      var actual = leetMock.tap('phoneNumber.1.areaCode', expected);
      assert.equal(actual, expected);

      done();
    });

    it('should return the value at the path if the graph is present', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var expected = 'New York';
      var actual = leetMock.tap('address.city');
      assert.equal(actual, expected);

      expected = 'fax';
      actual = leetMock.tap('phoneNumber.1.type');
      assert.equal(actual, expected);

      done();
    });
  });

  describe('#probe()', function () {
    it('should return true if the object graph is present', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.probe('address.city');
      assert.isTrue(actual);

      actual = leetMock.probe('phoneNumber.1');
      assert.isTrue(actual);

      actual = leetMock.probe('phoneNumber.1.number');
      assert.isTrue(actual);

      done();
    });

    it('should return false if the object graph is absent', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.probe('address.missing');
      assert.isFalse(actual);

      actual = leetMock.probe('phoneNumber.1.missing');
      assert.isFalse(actual);

      actual = leetMock.probe('phoneNumber.2');
      assert.isFalse(actual);

      done();
    });
  });

  describe('#collect()', function () {
    it('should return all values for all graphs', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.collect('firstName', 'address.state', 'phoneNumber.1.type');
      assert.lengthOf(actual, 3);
      assert.equal(actual[0], 'John');
      assert.equal(actual[1], 'NY');
      assert.equal(actual[2], 'fax');

      var args = ['firstName', 'address.state', 'phoneNumber.1.type'];
      actual = leetMock.collect(args);
      assert.lengthOf(actual, 3);
      assert.equal(actual[0], 'John');
      assert.equal(actual[1], 'NY');
      assert.equal(actual[2], 'fax');

      done();
    });

    it('should return undefined when graphs cannot be found', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.collect('firstName', 'address.missing', 'phoneNumber.1.missing');
      assert.lengthOf(actual, 3);
      assert.equal(actual[0], 'John');
      assert.equal(actual[1], undefined);
      assert.equal(actual[2], undefined);

      done();
    });

    it('should return default values when graphs cannot be found and default values are provided', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var args = {
        'firstName': 'Steve',
        'address.county': 'North County',
        'phoneNumber.1.areaCode': '555'
      };

      var actual = leetMock.collect(args);
      assert.lengthOf(actual, 3);
      assert.equal(actual[0], 'John');
      assert.equal(actual[1], args['address.county']);
      assert.equal(actual[2], args['phoneNumber.1.areaCode']);

      done();
    });
  });

  describe('#extract()', function () {
    it('should return all values for all graphs', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.extract('firstName', 'address.state', 'phoneNumber.1.type');
      assert.equal(Object.keys(actual).length, 3);
      assert.property(actual, 'firstName');
      assert.property(actual, 'address.state');
      assert.property(actual, 'phoneNumber.1.type');
      assert.equal(actual['firstName'], 'John');
      assert.equal(actual['address.state'], 'NY');
      assert.equal(actual['phoneNumber.1.type'], 'fax');

      var args = ['firstName', 'address.state', 'phoneNumber.1.type'];
      actual = leetMock.extract(args);
      assert.equal(Object.keys(actual).length, 3);
      assert.property(actual, 'firstName');
      assert.property(actual, 'address.state');
      assert.property(actual, 'phoneNumber.1.type');
      assert.equal(actual['firstName'], 'John');
      assert.equal(actual['address.state'], 'NY');
      assert.equal(actual['phoneNumber.1.type'], 'fax');

      done();
    });

    it('should return undefined when graphs cannot be found', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.extract('firstName', 'address.missing', 'phoneNumber.1.missing');
      assert.equal(Object.keys(actual).length, 3);
      assert.property(actual, 'firstName');
      assert.isTrue(actual.hasOwnProperty('address.missing'));
      assert.isTrue(actual.hasOwnProperty('phoneNumber.1.missing'));
      assert.equal(actual['firstName'], 'John');
      assert.equal(actual['address.missing'], undefined);
      assert.equal(actual['phoneNumber.1.missing'], undefined);

      done();
    });

    it('should return default values when graphs cannot be found and default values are provided', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var args = {
        'firstName': 'Steve',
        'address.county': 'North County',
        'phoneNumber.1.areaCode': '555'
      };

      var actual = leetMock.extract(args);
      assert.equal(Object.keys(actual).length, 3);
      assert.property(actual, 'firstName');
      assert.isTrue(actual.hasOwnProperty('address.county'));
      assert.isTrue(actual.hasOwnProperty('phoneNumber.1.areaCode'));
      assert.equal(actual['firstName'], 'John');
      assert.equal(actual['address.county'], args['address.county']);
      assert.equal(actual['phoneNumber.1.areaCode'], args['phoneNumber.1.areaCode']);

      done();
    });
  });

  describe('#hasAllProperties()', function () {
    it('should return true when all properties are present', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.hasAllProperties('firstName', 'lastName', 'phoneNumber');
      assert.isTrue(actual);

      var args = ['firstName', 'lastName', 'phoneNumber'];
      actual = leetMock.hasAllProperties(args);
      assert.isTrue(actual);

      done();
    });

    it('should return false if any properties are missing', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.hasAllProperties('firstName', 'lastName', 'missing');
      assert.isFalse(actual);

      var args = ['firstName', 'lastName', 'missing'];
      actual = leetMock.hasAllProperties(args);
      assert.isFalse(actual);

      done();
    });
  });

  describe('#hasAnyProperties()', function () {
    it('should return true if any properties are present', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.hasAnyProperties('firstName', 'missing1', 'missing2');
      assert.isTrue(actual);

      var args = ['firstName', 'missing1', 'missing2'];
      actual = leetMock.hasAnyProperties(args);
      assert.isTrue(actual);

      done();
    });

    it('should return false if no properties are present', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.hasAnyProperties('missing1', 'missing2', 'missing3');
      assert.isFalse(actual);

      var args = ['missing1', 'missing2', 'missing3'];
      actual = leetMock.hasAnyProperties(args);
      assert.isFalse(actual);

      done();
    });
  });

  describe('#probeAll()', function () {
    it('should return true if all paths are present', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.probeAll('address.city', 'address.state', 'phoneNumber.0');
      assert.isTrue(actual);

      var args = ['address.city', 'address.state', 'phoneNumber.0'];
      actual = leetMock.probeAll(args);
      assert.isTrue(actual);

      done();
    });

    it('should return false if any paths are missing', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.probeAll('address.city', 'address.state', 'phoneNumber.0.missing');
      assert.isFalse(actual);

      var args = ['address.city', 'address.state', 'phoneNumber.0.missing'];
      actual = leetMock.probeAll(args);
      assert.isFalse(actual);

      done();
    });
  });

  describe('#probeAny()', function () {
    it('should return true if any paths are present', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.probeAny('address.missing', 'address.state', 'phoneNumber.2');
      assert.isTrue(actual);

      var args = ['address.missing', 'address.state', 'phoneNumber.2'];
      actual = leetMock.probeAny(args);
      assert.isTrue(actual);

      done();
    });

    it('should return false if no paths are present', function (done) {
      var mock = mockObject();
      var leetMock = leet(mock);

      var actual = leetMock.probeAny('address.missing', 'missing', 'phoneNumber.2');
      assert.isFalse(actual);

      var args = ['address.missing', 'missing', 'phoneNumber.2'];
      actual = leetMock.probeAny(args);
      assert.isFalse(actual);

      done();
    });
  });

	describe('#truthy()', function () {
		it('should return true if a property is present and its value is truthy', function (done) {
			var mock = mockObject();
			mock.address.isUSAddress = true;
			var leetMock = leet(mock);
			assert.isTrue(leetMock.truthy('address.isUSAddress'));
			done();
		});

		it('should return false if a property is present and its value is falsy', function (done) {
			var mock = mockObject();
			mock.address.isRussianAddress = false;
			var leetMock = leet(mock);
			assert.isFalse(leetMock.truthy('address.isRussianAddress'));
			done();
		});

		it('should return false if a property is absent', function (done) {
			var mock = mockObject();
			var leetMock = leet(mock);
			assert.isFalse(leetMock.truthy('address.isUSAddress'));
			done();
		});
	});

  describe('#plant()', function () {
    it('creates a graph with a predetermined value', function (done) {
      var mock = {};
      var mockLeet = leet(mock);
      var expected = 'buz';
      mockLeet.plant('foo.bar.baz.bin', expected);
      assert.deepProperty(mock, 'foo.bar.baz.bin');
      assert.deepPropertyVal(mock, 'foo.bar.baz.bin', expected);
      done();
    });

    it('creates the remainder of an existing graph with a predetermined value', function (done) {
      var mock = {
        foo: {
          bar: {}
        }
      };
      var mockLeet = leet(mock);
      var expected = [1, 2, 3, 4];
      mockLeet.plant('foo.bar.baz.bin', expected);
      assert.deepProperty(mock, 'foo.bar.baz.bin');
      assert.deepPropertyVal(mock, 'foo.bar.baz.bin', expected);
      done();
    });

    it('overrides an existing graph value with a predetermined value', function (done) {
      var mock = {
        foo: {
          bar: {
            baz: {
              bin: 'blam'
            }
          }
        }
      };
      var mockLeet = leet(mock);
      var expected = {frak: 'brak'};
      mockLeet.plant('foo.bar.baz.bin', expected);
      assert.deepProperty(mock, 'foo.bar.baz.bin');
      assert.deepPropertyVal(mock, 'foo.bar.baz.bin', expected);
      done();
    });
  });
});