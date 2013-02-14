/*global jake, desc, task, directory, file*/
'use strict';
var pkg = require('./package.json'),
  path = require('path'),
  fs = require('fs'),
  os = require('os'),
  async = require('async');

var ROOT_DIR = __dirname,
  BUILD_DIR = path.join(ROOT_DIR, 'build'),
  TEST_DIR = path.join(ROOT_DIR, 'test');

namespace('package', function () {
  desc('gets the project version from package.json');
  task('version', function () {
    return pkg.version;
  });
});

desc('creates the build directory');
directory(BUILD_DIR);

desc('builds l33teral');
task('build', [BUILD_DIR], function () {
  console.log('@@ ROOT_DIR', ROOT_DIR);
  console.log('@@ BUILD_DIR', BUILD_DIR);

  var inputFiles = [
    path.join(ROOT_DIR, 'license.js'),
    path.join(ROOT_DIR, 'l33teral.js')
  ];
  var outputFile = path.join(BUILD_DIR, 'l33teral-' + pkg.version + '.js');
  concatFiles(inputFiles, outputFile, function (err) {
    if (err) {
      console.error(err);
    }
  });
});

desc('runs unit tests');
task('test', function () {
  console.log('@@ TEST_DIR', TEST_DIR);

  var mochaBin = path.join(ROOT_DIR, 'node_modules', '.bin', 'mocha');
  var testCmd = mochaBin + ' ' + TEST_DIR;
  jake.exec(testCmd, function () {}, {printStdout: true});
});

task('default', function () {
  console.log('l33teral -- l33t literals for JavaScript');
  console.log('To see available tasks:');
  console.log('$ jake --tasks');
});

function concatFiles(files, outputFile, callback) {
  var readHandlers = files.map(function (file) {
    return function (callback) {
      fs.readFile(file, function (err, data) {
        callback(err, data);
      })
    };
  });

  async.parallel(readHandlers, function (err, files) {
    if (err) {
      return callback(err);
    }
    fs.writeFile(outputFile, files.join(os.EOL), callback);
  });
}