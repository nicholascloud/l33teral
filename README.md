# l33teral

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

## Usage

Right now this is a node module, but I will probably port it to the browser soon.

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
      ]
    },
    department: {
      title: 'IT',
      budget: 1000000000.00
    }
  }
};

var myL33t = l33t(myLiteral);
// now use methods on myL33t
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
// assuming myL33t from above...

var permissionLevel = myL33t.tap('data.user.permissionLevel');
// 1

var permissionName = myL33t.tap('data.user.permissionName', 'is-legit');
// 'is-legit'

var thisWillThrow = myL33t.tap('data.pandas');
// throws an instance of GraphError
```

### probe (path)

Traverses an object literal along `path` and returns true or false if the path exists.

- @param {String} path in the form of `foo.bar.baz`
- @return {Boolean}

```javascript
// assuming myL33t from above...

if (myL33t.probe('data.user')) {
  var user = myL33t.obj.data.user;
}
```

### collect (paths)

 Collects the values from multiple paths and puts them into an array in the order of evaluation. Uses `tap` to retrieve values. The `paths` parameter may be either an arbitrary number of strings, an array of paths, or an object literal where keys represent paths and values represent default values for each path should the object graph lack the specified path. If no default values are specified (e.g., `paths` is an arbitrary number of String parameters or an array), the value `undefined` will be used as a default value for paths that cannot be found.

- @param {...String|Array|Object} paths
- @return {Array}

```javascript
// assuming myL33t from above...

var values = myL33t.collect('data.user.name', 'data.user.phoneNumbers.1', 'data.department.title');
// ['Susan', '444-555-6666', 'IT']
```

### extract (paths)

Collects the values from multiple paths and puts them into an object literal where the keys are the paths and the values are those found at each path in the original object literal. If no default values are specified (e.g., `paths` is an arbitrary number of String parameters or an array), the value `undefined` will be used as a default value for paths that cannot be found.

- @param {...String|Array|Object} paths

```javascript
// assuming myL33t from above...

var values = myL33t.extract('data.user.name', 'data.user.phoneNumbers.1', 'data.department.title');
// {
//  'data.user.name': 'Susan',
//  'data.user.phoneNumbers.1': '444-555-6666',
//  'data.department.title': 'IT'
// }
```

### hasAllProperties (properties)

Determines if the object has all specified properties

__NOTE__: Like `hasOwnProperty`, this tests only for immediate instance properties. For graph testing, use `hasAllGraphs`.

- @param {...String|Array} properties
- @return {Boolean}

```javascript
var user = {
  name: 'Susan',
  permissionLevel: 1,
  title: 'Badass',
  startDate: '2013-01-01'
};

var l33tUser = l33t(user);
l33tUser.hasAllProperties('name', 'title', 'startDate');
// true
```

### hasAnyProperties (properties)

Determines if the object has any of the specified properties

__NOTE__: Like `hasOwnProperty`, this tests only for immediate instance properties. For graph testing, use `hasAnyGraphs`.

- @param {...String|Array} properties
- @return {Boolean}

```javascript
var user = {
  name: 'Susan',
  permissionLevel: 1,
  title: 'Badass',
  startDate: '2013-01-01'
};

var l33tUser = l33t(user);
l33tUser.hasAnyProperties('dob', 'title', 'ssn');
// true
```

### probeAll (paths)

Determines if the object has all of the specified paths

- @param {...String|Array} paths
- @return {Boolean}

```javascript
// assuming myL33t from above...

myL33t.probeAll('data.user', 'data.department', 'data.user.phoneNumbers.0');
// true
```

### probeAny (paths)

Determines if the object has any of the specified paths

- @param {...String|Array} paths
- @return {*}

```javascript
// assuming myL33t from above...

myL33t.probeAny('data.bosses', 'data.department', 'wat');
// true
```

-----

## The MIT License (MIT)

### Copyright (c) 2013 Nicholas Cloud

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.