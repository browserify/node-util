var test = require('tape');
var util = require('../../');

test('util.types', function (t) {
  t.doesNotThrow(function () { return require('../node/types') });
  t.end();
});
