var common = require('./common');
var assert = require('assert');
var fs = require('fs');
var vm = require('vm');
var promisify = require('../../util').promisify;

if (typeof Promise === 'undefined') {
  console.log('no global Promise found, skipping promisify tests');
  return;
}

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
  function fn2() {}
  fn2[promisify.custom] = 42;
  common.expectsError(
    function () { promisify(fn2); },
    { code: 'ERR_INVALID_ARG_TYPE', type: TypeError }
  );
}

// promisify args test disabled, it is an internal core API that is
// not used anywhere anymore and this package does not implement it.
if (false) {
  var firstValue = 5;
  var secondValue = 17;

  function fn3(callback) {
    callback(null, firstValue, secondValue);
  }

  fn3[customPromisifyArgs] = ['first', 'second'];

  promisify(fn3)().then(common.mustCall(function (obj) {
    assert.deepStrictEqual(obj, { first: firstValue, second: secondValue });
  }));
}

{
  var fn4 = vm.runInNewContext('(function() {})');
  assert.notStrictEqual(Object.getPrototypeOf(promisify(fn4)),
                        Function.prototype);
}

{
  function fn5(callback) {
    callback(null, 'foo', 'bar');
  }
  promisify(fn5)().then(common.mustCall(function (value) {
    assert.deepStrictEqual(value, 'foo');
  }));
}

{
  function fn6(callback) {
    callback(null);
  }
  promisify(fn6)().then(common.mustCall(function (value) {
    assert.strictEqual(value, undefined);
  }));
}

{
  function fn7(callback) {
    callback();
  }
  promisify(fn7)().then(common.mustCall(function (value) {
    assert.strictEqual(value, undefined);
  }));
}

{
  function fn8(err, val, callback) {
    callback(err, val);
  }
  promisify(fn8)(null, 42).then(common.mustCall(function (value) {
    assert.strictEqual(value, 42);
  }));
}

{
  function fn9(err, val, callback) {
    callback(err, val);
  }
  promisify(fn9)(new Error('oops'), null).catch(common.mustCall(function (err) {
    assert.strictEqual(err.message, 'oops');
  }));
}

{
  function fn9(err, val, callback) {
    callback(err, val);
  }


  Promise.resolve()
    .then(function () { return promisify(fn9)(null, 42); })
    .then(function (value) {
      assert.strictEqual(value, 42);
    });
}

{
  var o = {};
  var fn10 = promisify(function(cb) {

    cb(null, this === o);
  });

  o.fn = fn10;

  o.fn().then(common.mustCall(function(val) {
    assert(val);
  }));
}

(function () {
  var err = new Error('Should not have called the callback with the error.');
  var stack = err.stack;

  var fn11 = promisify(function(cb) {
    cb(null);
    cb(err);
  });

  Promise.resolve()
    .then(function () { return fn11(); })
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
