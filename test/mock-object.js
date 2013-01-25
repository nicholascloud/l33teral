'use strict';
var _ = require('underscore');

//http://www.jquery4u.com/json/customer-form-json-file-example/
var obj = {
  "firstName": "John",
  "lastName": "Smith",
  "age": 25,
  "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10021"
  },
  "phoneNumber": [
    {
      "type": "home",
      "number": "212 555-1234"
    },
    {
      "type": "fax",
      "number": "646 555-4567"
    }
  ]
};

module.exports = function () {
  return _.clone(obj);
};