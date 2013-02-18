/*global jake, desc, task, directory, file, complete*/
'use strict';
var pkg = require('./package.json'),
  path = require('path'),
  fs = require('fs'),
  os = require('os'),
  async = require('async'),
  rimraf = require('rimraf');

var ROOT_DIR = __dirname,
  BUILD_DIR = path.join(ROOT_DIR, 'build'),
  TEST_DIR = path.join(ROOT_DIR, 'test');

namespace('package', function () {
  // gets the project version from package.json
  task('version', function () {
    return pkg.version;
  });
});

// creates the build directory
directory(BUILD_DIR);

desc('cleans previous builds');
task('clean', function () {
  rimraf(BUILD_DIR, function (err) {
    complete();
  });
}, {async: true});

desc('builds project');
task('build', ['clean', BUILD_DIR], function () {
  console.log('@@ ROOT_DIR', ROOT_DIR);
  console.log('@@ BUILD_DIR', BUILD_DIR);

  var inputFiles = [
    path.join(ROOT_DIR, 'license.js'),
    path.join(ROOT_DIR, 'l33teral.js')
  ];
  var outputFile = path.join(BUILD_DIR, 'l33teral-' + pkg.version + '.js');
  concatFiles(inputFiles, outputFile, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log('Build complete.');
    console.log('Output:', outputFile);
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