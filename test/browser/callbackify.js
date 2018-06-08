'use strict';

var test = require('tape');
var callbackify = require('../../').callbackify;

if (typeof Promise === 'undefined') {
  console.log('no global Promise found, skipping callbackify tests');
  return;
}

function after (n, cb) {
  var i = 0;
  return function () {
    if (++i === n) cb();
  }
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

test('util.callbackify resolution value is passed as second argument to callback', function (t) {
  var end = after(values.length * 2, t.end);
  // Test that the resolution value is passed as second argument to callback
  values.forEach(function(value) {
    // Test Promise factory
    function promiseFn() {
      return Promise.resolve(value);
    }

    var cbPromiseFn = callbackify(promiseFn);
    cbPromiseFn(function(err, ret) {
      t.ifError(err);
      t.strictEqual(ret, value, 'cb ' + typeof value);
      end();
    });

    // Test Thenable
    function thenableFn() {
      return {
        then: function(onRes, onRej) {
          onRes(value);
        }
      };
    }

    var cbThenableFn = callbackify(thenableFn);
    cbThenableFn(function(err, ret) {
      t.ifError(err);
      t.strictEqual(ret, value, 'thenable ' + typeof value);
      end();
    });
  });
});

test('util.callbackify rejection reason is passed as first argument to callback', function (t) {
  var end = after(values.length * 2, t.end);
  // Test that rejection reason is passed as first argument to callback
  values.forEach(function(value) {
    // test a Promise factory
    function promiseFn() {
      return Promise.reject(value);
    }

    var cbPromiseFn = callbackify(promiseFn);
    cbPromiseFn(function(err, ret) {
      t.strictEqual(ret, undefined, 'cb ' + typeof value);
      if (err instanceof Error) {
        if ('reason' in err) {
          t.ok(!value);
          t.strictEqual(err.message, 'Promise was rejected with a falsy value');
          t.strictEqual(err.reason, value);
        } else {
          t.strictEqual(String(value).slice(-err.message.length), err.message);
        }
      } else {
        t.strictEqual(err, value);
      }
      end();
    });

    // Test Thenable
    function thenableFn() {
      return {
        then: function (onRes, onRej) {
          onRej(value);
        }
      };
    }

    var cbThenableFn = callbackify(thenableFn);
    cbThenableFn(function(err, ret) {
      t.strictEqual(ret, undefined, 'thenable ' + typeof value);
      if (err instanceof Error) {
        if ('reason' in err) {
          t.ok(!value);
          t.strictEqual(err.message, 'Promise was rejected with a falsy value');
          t.strictEqual(err.reason, value);
        } else {
          t.strictEqual(String(value).slice(-err.message.length), err.message);
        }
      } else {
        t.strictEqual(err, value);
      }
      end();
    });
  });
});

test('util.callbackify arguments passed to callbackified function are passed to original', function (t) {
  var end = after(values.length, t.end);
  // Test that arguments passed to callbackified function are passed to original
  values.forEach(function(value) {
    function promiseFn(arg) {
      t.strictEqual(arg, value);
      return Promise.resolve(arg);
    }

    var cbPromiseFn = callbackify(promiseFn);
    cbPromiseFn(value, function(err, ret) {
      t.ifError(err);
      t.strictEqual(ret, value);
      end();
    });
  });
});

test('util.callbackify `this` binding is the same for callbackified and original', function (t) {
  var end = after(values.length, t.end);
  // Test that `this` binding is the same for callbackified and original
  values.forEach(function(value) {
    var iAmThis = {
      fn: function(arg) {
        t.strictEqual(this, iAmThis);
        return Promise.resolve(arg);
      },
    };
    iAmThis.cbFn = callbackify(iAmThis.fn);
    iAmThis.cbFn(value, function(err, ret) {
      t.ifError(err);
      t.strictEqual(ret, value);
      t.strictEqual(this, iAmThis);
      end();
    });
  });
});

test('util.callbackify non-function inputs throw', function (t) {
  // Verify that non-function inputs throw.
  ['foo', null, undefined, false, 0, {}, typeof Symbol !== 'undefined' ? Symbol() : undefined, []].forEach(function(value) {
    t.throws(
      function() { callbackify(value); },
      'The "original" argument must be of type Function'
    );
  });
  t.end();
});
