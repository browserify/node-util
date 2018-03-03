'use strict';
var assert = require('assert');
var fs = require('fs');
var vm = require('vm');
var promisify = require('../../util').promisify;

var mustCalls = [];
var common = {
  expectsError: function (fn, props) {
    try { fn(); }
    catch (err) {
      if (props.type) assert.equal(err.constructor, props.type);
      if (props.message) assert.equal(err.message, props.message);
      return;
    }
    assert.fail('expected error');
  },
  mustCall: function (fn) {
    function mustCall() {
      mustCall.called = true
      return fn.apply(this, arguments);
    }

    mustCalls.push(mustCall);
    return mustCall;
  }
};

var stat = promisify(fs.stat);

{
  var promise = stat(__filename);
  assert(promise instanceof Promise);
  promise.then(common.mustCall(function (value) {
    assert.deepStrictEqual(value, fs.statSync(__filename));
  }));
}

{
  var promise = stat('/dontexist');
  promise.catch(common.mustCall(function (error) {
    assert(error.message.indexOf('ENOENT: no such file or directory, stat') !== -1);
  }));
}

{
  function fn() {}
  function promisifedFn() {}
  fn[promisify.custom] = promisifedFn;
  assert.strictEqual(promisify(fn), promisifedFn);
  assert.strictEqual(promisify(promisify(fn)), promisifedFn);
}

{
  function fn() {}
  fn[promisify.custom] = 42;
  common.expectsError(
    function () { promisify(fn); },
    { code: 'ERR_INVALID_ARG_TYPE', type: TypeError }
  );
}

// promisify args test disabled, it is an internal core API that is
// not used anywhere anymore and this package does not implement it.
if (false) {
  var firstValue = 5;
  var secondValue = 17;

  function fn(callback) {
    callback(null, firstValue, secondValue);
  }

  fn[customPromisifyArgs] = ['first', 'second'];

  promisify(fn)().then(common.mustCall(function (obj) {
    assert.deepStrictEqual(obj, { first: firstValue, second: secondValue });
  }));
}

{
  var fn = vm.runInNewContext('(function() {})');
  assert.notStrictEqual(Object.getPrototypeOf(promisify(fn)),
                        Function.prototype);
}

{
  function fn(callback) {
    callback(null, 'foo', 'bar');
  }
  promisify(fn)().then(common.mustCall(function (value) {
    assert.deepStrictEqual(value, 'foo');
  }));
}

{
  function fn(callback) {
    callback(null);
  }
  promisify(fn)().then(common.mustCall(function (value) {
    assert.strictEqual(value, undefined);
  }));
}

{
  function fn(callback) {
    callback();
  }
  promisify(fn)().then(common.mustCall(function (value) {
    assert.strictEqual(value, undefined);
  }));
}

{
  function fn(err, val, callback) {
    callback(err, val);
  }
  promisify(fn)(null, 42).then(common.mustCall(function (value) {
    assert.strictEqual(value, 42);
  }));
}

{
  function fn(err, val, callback) {
    callback(err, val);
  }
  promisify(fn)(new Error('oops'), null).catch(common.mustCall(function (err) {
    assert.strictEqual(err.message, 'oops');
  }));
}

{
  function fn(err, val, callback) {
    callback(err, val);
  }


  Promise.resolve()
    .then(function () { promisify(fn)(null, 42); })
    .then(function (value) {
      assert.strictEqual(value, 42);
    });
}

{
  var o = {};
  var fn = promisify(function(cb) {

    cb(null, this === o);
  });

  o.fn = fn;

  o.fn().then(common.mustCall(function(val) {
    assert(val);
  }));
}

(function () {
  var err = new Error('Should not have called the callback with the error.');
  var stack = err.stack;

  var fn = promisify(function(cb) {
    cb(null);
    cb(err);
  });

  Promise.resolve()
    .then(function () { return fn(); })
    .then(function () { return Promise.resolve(); })
    .then(function () {
      assert.strictEqual(stack, err.stack);
    });
})();

{
  function c() { }
  var a = promisify(function() { });
  var b = promisify(a);
  assert.notStrictEqual(c, a);
  assert.strictEqual(a, b);
}

{
  var errToThrow;
  var thrower = promisify(function(a, b, c, cb) {
    errToThrow = new Error();
    throw errToThrow;
  });
  thrower(1, 2, 3)
    .then(assert.fail)
    .then(assert.fail, function (e) { assert.strictEqual(e, errToThrow); });
}

{
  var err = new Error();

  var a = promisify(function (cb) { cb(err) })();
  var b = promisify(function () { throw err; })();

  Promise.all([
    a.then(assert.fail, function(e) {
      assert.strictEqual(err, e);
    }),
    b.then(assert.fail, function(e) {
      assert.strictEqual(err, e);
    })
  ]);
}

[undefined, null, true, 0, 'str', {}, [], Symbol()].forEach(function (input) {
  common.expectsError(
    function () { promisify(input); },
    {
      code: 'ERR_INVALID_ARG_TYPE',
      type: TypeError,
      message: 'The "original" argument must be of type Function'
    });
});

process.on('exit', function () {
  mustCalls.forEach(function (mc) {
    assert(mc.called);
  });
});
