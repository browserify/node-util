var assert = require('assert');

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

process.on('exit', function () {
  mustCalls.forEach(function (mc) {
    assert(mc.called);
  });
});

module.exports = common;
