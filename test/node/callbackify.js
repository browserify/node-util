'use strict';

// This test checks that the semantics of `util.callbackify` are as described in
// the API docs

var common = require('./common');
var assert = require('assert');
var callbackify = require('../../').callbackify;
var execFile = require('child_process').execFile;

if (typeof Promise === 'undefined') {
  console.log('no global Promise found, skipping callbackify tests');
  return;
}

var values = [
  'hello world',
  null,
  undefined,
  false,
  0,
  {},
  { key: 'value' },
  function ok() {},
  ['array', 'with', 4, 'values'],
  new Error('boo')
];
if (typeof Symbol !== 'undefined') {
  values.push(Symbol('I am a symbol'));
}

{
  // Test that the resolution value is passed as second argument to callback
  values.forEach(function(value) {
    // Test Promise factory
    function promiseFn() {
      return Promise.resolve(value);
    }

    var cbPromiseFn = callbackify(promiseFn);
    cbPromiseFn(common.mustCall(function(err, ret) {
      assert.ifError(err);
      assert.strictEqual(ret, value);
    }));

    // Test Thenable
    function thenableFn() {
      return {
        then: function(onRes, onRej) {
          onRes(value);
        }
      };
    }

    var cbThenableFn = callbackify(thenableFn);
    cbThenableFn(common.mustCall(function(err, ret) {
      assert.ifError(err);
      assert.strictEqual(ret, value);
    }));
  });
}

{
  // Test that rejection reason is passed as first argument to callback
  values.forEach(function(value) {
    // test a Promise factory
    function promiseFn() {
      return Promise.reject(value);
    }

    var cbPromiseFn = callbackify(promiseFn);
    cbPromiseFn(common.mustCall(function(err, ret) {
      assert.strictEqual(ret, undefined);
      if (err instanceof Error) {
        if ('reason' in err) {
          assert(!value);
          assert.strictEqual(err.message, 'Promise was rejected with a falsy value');
          assert.strictEqual(err.reason, value);
        } else {
          assert.strictEqual(String(value).slice(-err.message.length), err.message);
        }
      } else {
        assert.strictEqual(err, value);
      }
    }));

    // Test Thenable
    function thenableFn() {
      return {
        then: function (onRes, onRej) {
          onRej(value);
        }
      };
    }

    var cbThenableFn = callbackify(thenableFn);
    cbThenableFn(common.mustCall(function(err, ret) {
      assert.strictEqual(ret, undefined);
      if (err instanceof Error) {
        if ('reason' in err) {
          assert(!value);
          assert.strictEqual(err.message, 'Promise was rejected with a falsy value');
          assert.strictEqual(err.reason, value);
        } else {
          assert.strictEqual(String(value).slice(-err.message.length), err.message);
        }
      } else {
        assert.strictEqual(err, value);
      }
    }));
  });
}

{
  // Test that arguments passed to callbackified function are passed to original
  values.forEach(function(value) {
    function promiseFn(arg) {
      assert.strictEqual(arg, value);
      return Promise.resolve(arg);
    }

    var cbPromiseFn = callbackify(promiseFn);
    cbPromiseFn(value, common.mustCall(function(err, ret) {
      assert.ifError(err);
      assert.strictEqual(ret, value);
    }));
  });
}

{
  // Test that `this` binding is the same for callbackified and original
  values.forEach(function(value) {
    var iAmThis = {
      fn: function(arg) {
        assert.strictEqual(this, iAmThis);
        return Promise.resolve(arg);
      },
    };
    iAmThis.cbFn = callbackify(iAmThis.fn);
    iAmThis.cbFn(value, common.mustCall(function(err, ret) {
      assert.ifError(err);
      assert.strictEqual(ret, value);
      assert.strictEqual(this, iAmThis);
    }));
  });
}

// These tests are not necessary in the browser.
if (false) {
  // Test that callback that throws emits an `uncaughtException` event
  var fixture = fixtures.path('uncaught-exceptions', 'callbackify1.js');
  execFile(
    process.execPath,
    [fixture],
    common.mustCall(function (err, stdout, stderr) {
      assert.strictEqual(err.code, 1);
      assert.strictEqual(Object.getPrototypeOf(err).name, 'Error');
      assert.strictEqual(stdout, '');
      var errLines = stderr.trim().split(/[\r\n]+/);
      var errLine = errLines.find(function (l) { return /^Error/.exec(l) });
      assert.strictEqual(errLine, 'Error: ' + fixture);
    })
  );
}

if (false) {
  // Test that handled `uncaughtException` works and passes rejection reason
  var fixture = fixtures.path('uncaught-exceptions', 'callbackify2.js');
  execFile(
    process.execPath,
    [fixture],
    common.mustCall(function (err, stdout, stderr) {
      assert.ifError(err);
      assert.strictEqual(stdout.trim(), fixture);
      assert.strictEqual(stderr, '');
    })
  );
}

{
  // Verify that non-function inputs throw.
  ['foo', null, undefined, false, 0, {}, typeof Symbol !== 'undefined' ? Symbol() : undefined, []].forEach(function(value) {
    common.expectsError(function() {
      callbackify(value);
    }, {
      code: 'ERR_INVALID_ARG_TYPE',
      type: TypeError,
      message: 'The "original" argument must be of type Function'
    });
  });
}

if (require('is-async-supported')()) {
  require('./callbackify-async');
}
