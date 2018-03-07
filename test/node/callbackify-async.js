'use strict';

// Separate test file for tests using new syntax (async/await).

var common = require('./common');
var assert = require('assert');
var callbackify = require('../../').callbackify;
var execFile = require('child_process').execFile;

var values = [
  'hello world',
  null,
  undefined,
  false,
  0,
  {},
  { key: 'value' },
  Symbol('I am a symbol'),
  function ok() {},
  ['array', 'with', 4, 'values'],
  new Error('boo')
];

{
  // Test that the resolution value is passed as second argument to callback
  values.forEach(function(value) {
    // Test and `async function`
    async function asyncFn() {
      return value;
    }

    var cbAsyncFn = callbackify(asyncFn);
    cbAsyncFn(common.mustCall(function(err, ret) {
      assert.ifError(err);
      assert.strictEqual(ret, value);
    }));
  });
}

{
  // Test that rejection reason is passed as first argument to callback
  values.forEach(function(value) {
    // Test an `async function`
    async function asyncFn() {
      return Promise.reject(value);
    }

    var cbAsyncFn = callbackify(asyncFn);
    cbAsyncFn(common.mustCall(function (err, ret) {
      assert.strictEqual(ret, undefined);
      if (err instanceof Error) {
        if ('reason' in err) {
          assert(!value);
          assert.strictEqual(err.message, 'Promise was rejected with a falsy value');
          assert.strictEqual(err.reason, value);
        } else {
          assert.strictEqual(String(value).endsWith(err.message), true);
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
    async function asyncFn(arg) {
      assert.strictEqual(arg, value);
      return arg;
    }

    var cbAsyncFn = callbackify(asyncFn);
    cbAsyncFn(value, common.mustCall(function(err, ret) {
      assert.ifError(err);
      assert.strictEqual(ret, value);
    }));
  });
}

{
  // Test that `this` binding is the same for callbackified and original
  values.forEach(function(value) {
    var iAmThat = {
      async fn(arg) {
        assert.strictEqual(this, iAmThat);
        return arg;
      },
    };
    iAmThat.cbFn = callbackify(iAmThat.fn);
    iAmThat.cbFn(value, common.mustCall(function(err, ret) {
      assert.ifError(err);
      assert.strictEqual(ret, value);
      assert.strictEqual(this, iAmThat);
    }));
  });
}

{
  async function asyncFn() {
    return 42;
  }

  var cb = callbackify(asyncFn);
  var args = [];

  // Verify that the last argument to the callbackified function is a function.
  ['foo', null, undefined, false, 0, {}, Symbol(), []].forEach(function(value) {
    args.push(value);
    common.expectsError(function() {
      cb(...args);
    }, {
      code: 'ERR_INVALID_ARG_TYPE',
      type: TypeError,
      message: 'The last argument must be of type Function'
    });
  });
}

