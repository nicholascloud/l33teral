# l33teral

[![Build Status](https://travis-ci.org/nicholascloud/l33teral.png)](https://travis-ci.org/nicholascloud/l33teral)

People who write JavaScript really like object literals. They are easy to use, easy to modify, and a general pain in the ass when used like this:

```javascript
function happyHandler(data) {
  if (data &&
    data.data &&
    data.data.user &&
    data.data.user.permissionLevel &&
    data.data.user.permissionLevel === 1) {

    //she's legit
  }
}
```

You might think I'm kidding about this but I've seen this code. It haunts my dreams. It makes me weep for the children.

I hate this so much that I created this library, `l33teral` (pronounced: `leet-er-all`) to stop this madness.

## Dependencies

None. (__Note__: l33teral < v3.0.0 depends on Underscore.js.)

## Usage

_l33teral will work in node.js, or in the browser with require.js, or in the browser as a direct include with script tags. All examples in the README are node.js examples, but the API is the same regardless of environment._

```javascript
var l33t = require('l33teral');

var myLiteral = {
  data: {
    user: {
      name: 'Susan',
      permissionLevel: 1,
      title: 'Badass',
      startDate: '2013-01-01',
      phoneNumbers: [
        '111-222-3333',
        '444-555-6666'
      ],
      isFullTime: true
    },
    department: {
      title: 'IT',
      budget: 1000000000.00
    }
  }
};

var myLeet = l33t(myLiteral);
// now use methods on myLeet
```

## The API

### obj

The original object passed to the module function.

### tap (path, defaultValue)

Traverses an object literal graph along `path` and returns a value if `path` exists. If `defaultValue` is specified, it will be returned if `path` does not exist. If it is not specified, a `GraphError` will be thrown.

- @param {String} path in the form of `foo.bar.baz`
- @param {*} [defaultValue]
- @return {*}
- @throws {GraphError}

```javascript
// assuming myLeet from above...

var permissionLevel = myLeet.tap('data.user.permissionLevel');
// 1

var permissionName = myLeet.tap('data.user.permissionName', 'is-legit');
// 'is-legit'

var thisWillThrow = myLeet.tap('data.pandas');
// throws an instance of GraphError
```

### probe (path)

Traverses an object literal along `path` and returns true or false if the path exists.

- @param {String} path in the form of `foo.bar.baz`
- @return {Boolean}

```javascript
// assuming myLeet from above...

if (myLeet.probe('data.user')) {
  var user = myLeet.obj.data.user;
}
```

### collect (paths)

 Collects the values from multiple paths and puts them into an array in the order of evaluation. Uses `tap` to retrieve values. The `paths` parameter may be either an arbitrary number of strings, an array of paths, or an object literal where keys represent paths and values represent default values for each path should the object graph lack the specified path. If no default values are specified (e.g., `paths` is an arbitrary number of String parameters or an array), the value `undefined` will be used as a default value for paths that cannot be found.

- @param {...String|Array|Object} paths
- @return {Array}

```javascript
// assuming myLeet from above...

var values = myLeet.collect('data.user.name', 'data.user.phoneNumbers.1', 'data.department.title');
// ['Susan', '444-555-6666', 'IT']
```

### extract (paths)

Collects the values from multiple paths and puts them into an object literal where the keys are the paths and the values are those found at each path in the original object literal. If no default values are specified (e.g., `paths` is an arbitrary number of String parameters or an array), the value `undefined` will be used as a default value for paths that cannot be found.

- @param {...String|Array|Object} paths

```javascript
// assuming myLeet from above...

var values = myLeet.extract('data.user.name', 'data.user.phoneNumbers.1', 'data.department.title');
// {
//  'data.user.name': 'Susan',
//  'data.user.phoneNumbers.1': '444-555-6666',
//  'data.department.title': 'IT'
// }
```

### hasAllProperties (properties)

Determines if the object has all specified properties

__NOTE__: Like `hasOwnProperty`, this tests only for immediate instance properties. For graph testing, use `probeAll`.

- @param {...String|Array} properties
- @return {Boolean}

```javascript
var user = {
  name: 'Susan',
  permissionLevel: 1,
  title: 'Badass',
  startDate: '2013-01-01'
};

var leetUser = l33t(user);
leetUser.hasAllProperties('name', 'title', 'startDate');
// true
```

### hasAnyProperties (properties)

Determines if the object has any of the specified properties

__NOTE__: Like `hasOwnProperty`, this tests only for immediate instance properties. For graph testing, use `probeAny`.

- @param {...String|Array} properties
- @return {Boolean}

```javascript
var user = {
  name: 'Susan',
  permissionLevel: 1,
  title: 'Badass',
  startDate: '2013-01-01'
};

var leetUser = l33t(user);
leetUser.hasAnyProperties('dob', 'title', 'ssn');
// true
```

### probeAll (paths)

Determines if the object has all of the specified paths

- @param {...String|Array} paths
- @return {Boolean}

```javascript
// assuming myLeet from above...

myLeet.probeAll('data.user', 'data.department', 'data.user.phoneNumbers.0');
// true
```

### probeAny (paths)

Determines if the object has any of the specified paths

- @param {...String|Array} paths
- @return {*}

```javascript
// assuming myLeet from above...

myLeet.probeAny('data.bosses', 'data.department', 'wat');
// true
```

### truthy (paths)

Determines if the object has the path(s) specified, and if the value at path(s) is truthy.

- @param {...String|Array} paths
- @return {Boolean}

```javascript
// assuming myLeet from above...

myLeet.truthy('data.user.isFullTime');
//true

myLeet.truthy('data.department.employeeCount');
//false; missing property 'employeeCount'
```

### plant (path, value)

Plants a value at a path, creating the graph if it does not exist. All segments in the path are treated as object properties.

- @param {String} path
- @param {*} value
- @return

```javascript
// assuming myLeet from above...

var schedule = ['M', 'T', 'W', 'F'];
myLeet.plant('data.user.schedule', schedule);
//myLeet.obj.data.user.schedule === schedule
```

### snip (path, suppressError)

Deletes the key at the end of an object path.

- @param {String} path
- @param {Boolean} [suppressError] - prevent a {GraphError} from being thrown if any part of the path cannot be fully resolved
- @throws {GraphError}

```javascript
var mock = {foo: {bar: {baz: 'bin'}}};
var mockLeet = l33t(mock);
mockLeet.snip('foo.bar.baz');
assert.property(mock.foo, 'bar');
assert.notProperty(mock.foo.bar, 'baz');
```

### purge (path, suppressError)

Deletes the key at the end of an object path (like `snip`), and all keys along the path in reverse if they resolve to empty objects, e.g.: given the literal `{foo: {stop:1, bar: {baz: {} } } }`, baz and bar would be deleted given the path `foo.bar.baz`, but foo would remain with the property `stop` because foo is not "empty" (still has keys).

- @param {String} path
- @param {Boolean} [suppressError] - prevent a {GraphError} from being thrown if any part of the path cannot be fully resolved
- @throws {GraphError}

```javascript
var mock = {foo: {stop:1, bar: {baz: {bin: {} } } } };
var mockLeet = l33t(mock);
mockLeet.purge('foo.bar.baz.bin');
assert.property(mock, 'foo');
assert.property(mock.foo, 'stop');
assert.notProperty(mock.foo, 'bar');
```

-----

## The MIT License (MIT)

### Copyright (c) 2013 Nicholas Cloud

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
