// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.




var assert = require('assert');
var vm = require('vm');
var util = require('../../');

assert.strictEqual(util.inspect(1), '1');
assert.strictEqual(util.inspect(false), 'false');
assert.strictEqual(util.inspect(''), "''");
assert.strictEqual(util.inspect('hello'), "'hello'");
assert.strictEqual(util.inspect(function() {}), '[Function]');
assert.strictEqual(util.inspect(() => {}), '[Function]');
assert.strictEqual(util.inspect(async function() {}), '[AsyncFunction]');
assert.strictEqual(util.inspect(async () => {}), '[AsyncFunction]');
assert.strictEqual(util.inspect(function*() {}), '[GeneratorFunction]');
assert.strictEqual(util.inspect(undefined), 'undefined');
assert.strictEqual(util.inspect(null), 'null');
assert.strictEqual(util.inspect(/foo(bar\n)?/gi), '/foo(bar\\n)?/gi');
assert.strictEqual(
  util.inspect(new Date('Sun, 14 Feb 2010 11:48:40 GMT')),
  new Date('2010-02-14T12:48:40+01:00').toISOString()
);
assert.strictEqual(util.inspect(new Date('')), (new Date('')).toString());
assert.strictEqual(util.inspect('\n\u0001'), "'\\n\\u0001'");
assert.strictEqual(
  util.inspect(`${Array(75).fill(1)}'\n\u001d\n\u0003`),
  `'${Array(75).fill(1)}\\'\\n\\u001d\\n\\u0003'`
);
assert.strictEqual(util.inspect([]), '[]');
assert.strictEqual(util.inspect(Object.create([])), 'Array {}');
assert.strictEqual(util.inspect([1, 2]), '[ 1, 2 ]');
assert.strictEqual(util.inspect([1, [2, 3]]), '[ 1, [ 2, 3 ] ]');
assert.strictEqual(util.inspect({}), '{}');
assert.strictEqual(util.inspect({ a: 1 }), '{ a: 1 }');
assert.strictEqual(util.inspect({ a: function() {} }), '{ a: [Function: a] }');
assert.strictEqual(util.inspect({ a: () => {} }), '{ a: [Function: a] }');
assert.strictEqual(util.inspect({ a: async function() {} }),
                   '{ a: [AsyncFunction: a] }');
assert.strictEqual(util.inspect({ a: async () => {} }),
                   '{ a: [AsyncFunction: a] }');
assert.strictEqual(util.inspect({ a: function*() {} }),
                   '{ a: [GeneratorFunction: a] }');
assert.strictEqual(util.inspect({ a: 1, b: 2 }), '{ a: 1, b: 2 }');
assert.strictEqual(util.inspect({ 'a': {} }), '{ a: {} }');
assert.strictEqual(util.inspect({ 'a': { 'b': 2 } }), '{ a: { b: 2 } }');
assert.strictEqual(util.inspect({ 'a': { 'b': { 'c': { 'd': 2 } } } }),
                   '{ a: { b: { c: [Object] } } }');
assert.strictEqual(
  util.inspect({ 'a': { 'b': { 'c': { 'd': 2 } } } }, false, null),
  '{ a: { b: { c: { d: 2 } } } }');
assert.strictEqual(util.inspect([1, 2, 3], true), '[ 1, 2, 3, [length]: 3 ]');
assert.strictEqual(util.inspect({ 'a': { 'b': { 'c': 2 } } }, false, 0),
                   '{ a: [Object] }');
assert.strictEqual(util.inspect({ 'a': { 'b': { 'c': 2 } } }, false, 1),
                   '{ a: { b: [Object] } }');
assert.strictEqual(util.inspect({ 'a': { 'b': ['c'] } }, false, 1),
                   '{ a: { b: [Array] } }');
assert.strictEqual(util.inspect(new Uint8Array(0)), 'Uint8Array [  ]');
assert.strictEqual(
  util.inspect(
    Object.create(
      {},
      { visible: { value: 1, enumerable: true }, hidden: { value: 2 } }
    )
  ),
  '{ visible: 1 }'
);
assert.strictEqual(
  util.inspect(
    Object.assign(new String('hello'), { [Symbol('foo')]: 123 }),
    { showHidden: true }
  ),
  '{ [String: \'hello\'] [length]: 5, [Symbol(foo)]: 123 }'
);

{
  const regexp = /regexp/;
  regexp.aprop = 42;
  assert.strictEqual(util.inspect({ a: regexp }, false, 0), '{ a: /regexp/ }');
}

assert(/Object/.test(
  util.inspect({ a: { a: { a: { a: {} } } } }, undefined, undefined, true)
));
assert(!/Object/.test(
  util.inspect({ a: { a: { a: { a: {} } } } }, undefined, null, true)
));

for (const showHidden of [true, false]) {
  const ab = new ArrayBuffer(4);
  const dv = new DataView(ab, 1, 2);
  assert.strictEqual(
    util.inspect(ab, showHidden),
    'ArrayBuffer { byteLength: 4 }'
  );
  assert.strictEqual(util.inspect(new DataView(ab, 1, 2), showHidden),
                     'DataView {\n' +
                     '  byteLength: 2,\n' +
                     '  byteOffset: 1,\n' +
                     '  buffer: ArrayBuffer { byteLength: 4 } }');
  assert.strictEqual(
    util.inspect(ab, showHidden),
    'ArrayBuffer { byteLength: 4 }'
  );
  assert.strictEqual(util.inspect(dv, showHidden),
                     'DataView {\n' +
                     '  byteLength: 2,\n' +
                     '  byteOffset: 1,\n' +
                     '  buffer: ArrayBuffer { byteLength: 4 } }');
  ab.x = 42;
  dv.y = 1337;
  assert.strictEqual(util.inspect(ab, showHidden),
                     'ArrayBuffer { byteLength: 4, x: 42 }');
  assert.strictEqual(util.inspect(dv, showHidden),
                     'DataView {\n' +
                     '  byteLength: 2,\n' +
                     '  byteOffset: 1,\n' +
                     '  buffer: ArrayBuffer { byteLength: 4, x: 42 },\n' +
                     '  y: 1337 }');
}

// Now do the same checks but from a different context
for (const showHidden of [true, false]) {
  const ab = vm.runInNewContext('new ArrayBuffer(4)');
  const dv = vm.runInNewContext('new DataView(ab, 1, 2)', { ab });
  assert.strictEqual(
    util.inspect(ab, showHidden),
    'ArrayBuffer { byteLength: 4 }'
  );
  assert.strictEqual(util.inspect(new DataView(ab, 1, 2), showHidden),
                     'DataView {\n' +
                     '  byteLength: 2,\n' +
                     '  byteOffset: 1,\n' +
                     '  buffer: ArrayBuffer { byteLength: 4 } }');
  assert.strictEqual(
    util.inspect(ab, showHidden),
    'ArrayBuffer { byteLength: 4 }'
  );
  assert.strictEqual(util.inspect(dv, showHidden),
                     'DataView {\n' +
                     '  byteLength: 2,\n' +
                     '  byteOffset: 1,\n' +
                     '  buffer: ArrayBuffer { byteLength: 4 } }');
  ab.x = 42;
  dv.y = 1337;
  assert.strictEqual(util.inspect(ab, showHidden),
                     'ArrayBuffer { byteLength: 4, x: 42 }');
  assert.strictEqual(util.inspect(dv, showHidden),
                     'DataView {\n' +
                     '  byteLength: 2,\n' +
                     '  byteOffset: 1,\n' +
                     '  buffer: ArrayBuffer { byteLength: 4, x: 42 },\n' +
                     '  y: 1337 }');
}


[ Float32Array,
  Float64Array,
  Int16Array,
  Int32Array,
  Int8Array,
  Uint16Array,
  Uint32Array,
  Uint8Array,
  Uint8ClampedArray ].forEach((constructor) => {
  const length = 2;
  const byteLength = length * constructor.BYTES_PER_ELEMENT;
  const array = new constructor(new ArrayBuffer(byteLength), 0, length);
  array[0] = 65;
  array[1] = 97;
  assert.strictEqual(
    util.inspect(array, true),
    `${constructor.name} [\n` +
      '  65,\n' +
      '  97,\n' +
      `  [BYTES_PER_ELEMENT]: ${constructor.BYTES_PER_ELEMENT},\n` +
      `  [length]: ${length},\n` +
      `  [byteLength]: ${byteLength},\n` +
      '  [byteOffset]: 0,\n' +
      `  [buffer]: ArrayBuffer { byteLength: ${byteLength} } ]`);
  assert.strictEqual(
    util.inspect(array, false),
    `${constructor.name} [ 65, 97 ]`
  );
});

// Now check that declaring a TypedArray in a different context works the same
[ Float32Array,
  Float64Array,
  Int16Array,
  Int32Array,
  Int8Array,
  Uint16Array,
  Uint32Array,
  Uint8Array,
  Uint8ClampedArray ].forEach((constructor) => {
  const length = 2;
  const byteLength = length * constructor.BYTES_PER_ELEMENT;
  const array = vm.runInNewContext(
    'new constructor(new ArrayBuffer(byteLength), 0, length)',
    { constructor, byteLength, length }
  );
  array[0] = 65;
  array[1] = 97;
  assert.strictEqual(
    util.inspect(array, true),
    `${constructor.name} [\n` +
      '  65,\n' +
      '  97,\n' +
      `  [BYTES_PER_ELEMENT]: ${constructor.BYTES_PER_ELEMENT},\n` +
      `  [length]: ${length},\n` +
      `  [byteLength]: ${byteLength},\n` +
      '  [byteOffset]: 0,\n' +
      `  [buffer]: ArrayBuffer { byteLength: ${byteLength} } ]`);
  assert.strictEqual(
    util.inspect(array, false),
    `${constructor.name} [ 65, 97 ]`
  );
});

assert.strictEqual(
  util.inspect(Object.create({}, {
    visible: { value: 1, enumerable: true },
    hidden: { value: 2 }
  }), { showHidden: true }),
  '{ visible: 1, [hidden]: 2 }'
);
// Objects without prototype
assert.strictEqual(
  util.inspect(Object.create(null, {
    name: { value: 'Tim', enumerable: true },
    hidden: { value: 'secret' }
  }), { showHidden: true }),
  "{ name: 'Tim', [hidden]: 'secret' }"
);

assert.strictEqual(
  util.inspect(Object.create(null, {
    name: { value: 'Tim', enumerable: true },
    hidden: { value: 'secret' }
  })),
  '{ name: \'Tim\' }'
);

// Dynamic properties
{
  assert.strictEqual(
    util.inspect({ get readonly() {} }),
    '{ readonly: [Getter] }');

  assert.strictEqual(
    util.inspect({ get readwrite() {}, set readwrite(val) {} }),
    '{ readwrite: [Getter/Setter] }');

  assert.strictEqual(
    util.inspect({ set writeonly(val) {} }),
    '{ writeonly: [Setter] }');

  const value = {};
  value.a = value;
  assert.strictEqual(util.inspect(value), '{ a: [Circular] }');
}

// Array with dynamic properties
{
  const value = [1, 2, 3];
  Object.defineProperty(
    value,
    'growingLength',
    {
      enumerable: true,
      get: function() { this.push(true); return this.length; }
    }
  );
  Object.defineProperty(
    value,
    '-1',
    {
      enumerable: true,
      value: -1
    }
  );
  assert.strictEqual(util.inspect(value),
                     '[ 1, 2, 3, growingLength: [Getter], \'-1\': -1 ]');
}

// Array with inherited number properties
{
  class CustomArray extends Array {}
  CustomArray.prototype[5] = 'foo';
  const arr = new CustomArray(50);
  assert.strictEqual(util.inspect(arr), 'CustomArray [ <50 empty items> ]');
}

// Array with extra properties
{
  const arr = [1, 2, 3, , ];
  arr.foo = 'bar';
  assert.strictEqual(util.inspect(arr),
                     "[ 1, 2, 3, <1 empty item>, foo: 'bar' ]");

  const arr2 = [];
  assert.strictEqual(util.inspect([], { showHidden: true }), '[ [length]: 0 ]');
  arr2['00'] = 1;
  assert.strictEqual(util.inspect(arr2), "[ '00': 1 ]");
  assert.strictEqual(util.inspect(arr2, { showHidden: true }),
                     "[ [length]: 0, '00': 1 ]");
  arr2[1] = 0;
  assert.strictEqual(util.inspect(arr2), "[ <1 empty item>, 0, '00': 1 ]");
  assert.strictEqual(util.inspect(arr2, { showHidden: true }),
                     "[ <1 empty item>, 0, [length]: 2, '00': 1 ]");
  delete arr2[1];
  assert.strictEqual(util.inspect(arr2), "[ <2 empty items>, '00': 1 ]");
  assert.strictEqual(util.inspect(arr2, { showHidden: true }),
                     "[ <2 empty items>, [length]: 2, '00': 1 ]");
  arr2['01'] = 2;
  assert.strictEqual(util.inspect(arr2),
                     "[ <2 empty items>, '00': 1, '01': 2 ]");
  assert.strictEqual(util.inspect(arr2, { showHidden: true }),
                     "[ <2 empty items>, [length]: 2, '00': 1, '01': 2 ]");

  const arr3 = [];
  arr3[-1] = -1;
  assert.strictEqual(util.inspect(arr3), "[ '-1': -1 ]");
}

// Indices out of bounds
{
  const arr = [];
  arr[2 ** 32] = true; // not a valid array index
  assert.strictEqual(util.inspect(arr), "[ '4294967296': true ]");
  arr[0] = true;
  arr[10] = true;
  assert.strictEqual(util.inspect(arr),
                     "[ true, <9 empty items>, true, '4294967296': true ]");
  arr[2 ** 32 - 2] = true;
  arr[2 ** 32 - 1] = true;
  arr[2 ** 32 + 1] = true;
  delete arr[0];
  delete arr[10];
  assert.strictEqual(util.inspect(arr),
                     ['[ <4294967294 empty items>,',
                      'true,',
                      "'4294967296': true,",
                      "'4294967295': true,",
                      "'4294967297': true ]"
                     ].join('\n  '));
}

// Function with properties
{
  const value = () => {};
  value.aprop = 42;
  assert.strictEqual(util.inspect(value), '{ [Function: value] aprop: 42 }');
}

// Anonymous function with properties
{
  const value = (() => function() {})();
  value.aprop = 42;
  assert.strictEqual(util.inspect(value), '{ [Function] aprop: 42 }');
}

// Regular expressions with properties
{
  const value = /123/ig;
  value.aprop = 42;
  assert.strictEqual(util.inspect(value), '{ /123/gi aprop: 42 }');
}

// Dates with properties
{
  const value = new Date('Sun, 14 Feb 2010 11:48:40 GMT');
  value.aprop = 42;
  assert.strictEqual(util.inspect(value),
                     '{ 2010-02-14T11:48:40.000Z aprop: 42 }');
}
// test the internal isDate implementation
var Date2 = require('vm').runInNewContext('Date');
var d = new Date2();
var orig = util.inspect(d);
Date2.prototype.foo = 'bar';
var after = util.inspect(d);
assert.equal(orig, after);

// test for sparse array
{
  const a = ['foo', 'bar', 'baz'];
  assert.strictEqual(util.inspect(a), '[ \'foo\', \'bar\', \'baz\' ]');
  delete a[1];
  assert.strictEqual(util.inspect(a), '[ \'foo\', <1 empty item>, \'baz\' ]');
  assert.strictEqual(
    util.inspect(a, true),
    '[ \'foo\', <1 empty item>, \'baz\', [length]: 3 ]'
  );
  assert.strictEqual(util.inspect(new Array(5)), '[ <5 empty items> ]');
  a[3] = 'bar';
  a[100] = 'qux';
  assert.strictEqual(
    util.inspect(a, { breakLength: Infinity }),
    '[ \'foo\', <1 empty item>, \'baz\', \'bar\', <96 empty items>, \'qux\' ]'
  );
  delete a[3];
  assert.strictEqual(
    util.inspect(a, { maxArrayLength: 4 }),
    '[ \'foo\', <1 empty item>, \'baz\', <97 empty items>, ... 1 more item ]'
  );
}

// test for other constructors in different context
{
  let obj = vm.runInNewContext('(function(){return {}})()', {});
  assert.strictEqual(util.inspect(obj), '{}');
  obj = vm.runInNewContext('var m=new Map();m.set(1,2);m', {});
  assert.strictEqual(util.inspect(obj), 'Map { 1 => 2 }');
  obj = vm.runInNewContext('var s=new Set();s.add(1);s.add(2);s', {});
  assert.strictEqual(util.inspect(obj), 'Set { 1, 2 }');
  obj = vm.runInNewContext('fn=function(){};new Promise(fn,fn)', {});
  assert.strictEqual(util.inspect(obj), 'Promise {  }');
}

// test for property descriptors
var getter = Object.create(null, {
  a: {
    get: function() { return 'aaa'; }
  }
});
var setter = Object.create(null, {
  b: {
    set: function() {}
  }
});
var getterAndSetter = Object.create(null, {
  c: {
    get: function() { return 'ccc'; },
    set: function() {}
  }
});
assert.equal(util.inspect(getter, true), '{ [a]: [Getter] }');
assert.equal(util.inspect(setter, true), '{ [b]: [Setter] }');
assert.equal(util.inspect(getterAndSetter, true), '{ [c]: [Getter/Setter] }');

// exceptions should print the error message, not '{}'
{
  var errors = [];
  errors.push(new Error());
  errors.push(new Error('FAIL'));
  errors.push(new TypeError('FAIL'));
  errors.push(new SyntaxError('FAIL'));
  errors.forEach((err) => {
    assert.strictEqual(util.inspect(err), err.stack);
  });
  try {
    undef(); // eslint-disable-line no-undef
  } catch (e) {
    assert.strictEqual(util.inspect(e), e.stack);
  }
  var ex = util.inspect(new Error('FAIL'), true);
  assert(ex.indexOf('Error: FAIL') !== -1);
  assert(ex.indexOf('[stack]') !== -1);
  assert(ex.indexOf('[message]') !== -1);
}

// GH-1941
// should not throw:
assert.equal(util.inspect(Object.create(Date.prototype)), 'Date {}');

// GH-1944
assert.doesNotThrow(function() {
  var d = new Date();
  d.toUTCString = null;
  util.inspect(d);
});

assert.doesNotThrow(function() {
  var d = new Date();
  d.toISOString = null;
  util.inspect(d);
});

assert.doesNotThrow(function() {
  var r = /regexp/;
  r.toString = null;
  util.inspect(r);
});

// bug with user-supplied inspect function returns non-string
assert.doesNotThrow(function() {
  util.inspect([{
    inspect: function() { return 123; }
  }]);
});

// GH-2225
var x = { inspect: util.inspect };
assert.ok(util.inspect(x).indexOf('inspect') != -1);

// util.inspect.styles and util.inspect.colors
function testColorStyle(style, input, implicit) {
  var color_name = util.inspect.styles[style];
  var color = ['', ''];
  if(util.inspect.colors[color_name])
    color = util.inspect.colors[color_name];

  var without_color = util.inspect(input, false, 0, false);
  var with_color = util.inspect(input, false, 0, true);
  var expect = '\u001b[' + color[0] + 'm' + without_color +
               '\u001b[' + color[1] + 'm';
  assert.equal(with_color, expect, 'util.inspect color for style '+style);
}

testColorStyle('special', function(){});
testColorStyle('number', 123.456);
testColorStyle('boolean', true);
testColorStyle('undefined', undefined);
testColorStyle('null', null);
testColorStyle('string', 'test string');
testColorStyle('date', new Date);
testColorStyle('regexp', /regexp/);

// an object with "hasOwnProperty" overwritten should not throw
assert.doesNotThrow(function() {
  util.inspect({
    hasOwnProperty: null
  });
});

// new API, accepts an "options" object
var subject = { foo: 'bar', hello: 31, a: { b: { c: { d: 0 } } } };
Object.defineProperty(subject, 'hidden', { enumerable: false, value: null });

assert(util.inspect(subject, { showHidden: false }).indexOf('hidden') === -1);
assert(util.inspect(subject, { showHidden: true }).indexOf('hidden') !== -1);
assert(util.inspect(subject, { colors: false }).indexOf('\u001b[32m') === -1);
assert(util.inspect(subject, { colors: true }).indexOf('\u001b[32m') !== -1);
assert(util.inspect(subject, { depth: 2 }).indexOf('c: [Object]') !== -1);
assert(util.inspect(subject, { depth: 0 }).indexOf('a: [Object]') !== -1);
assert(util.inspect(subject, { depth: null }).indexOf('{ d: 0 }') !== -1);

// "customInspect" option can enable/disable calling inspect() on objects
subject = { inspect: function() { return 123; } };

assert(util.inspect(subject, { customInspect: true }).indexOf('123') !== -1);
assert(util.inspect(subject, { customInspect: true }).indexOf('inspect') === -1);
assert(util.inspect(subject, { customInspect: false }).indexOf('123') === -1);
assert(util.inspect(subject, { customInspect: false }).indexOf('inspect') !== -1);

// custom inspect() functions should be able to return other Objects
subject.inspect = function() { return { foo: 'bar' }; };

assert.equal(util.inspect(subject), '{ foo: \'bar\' }');

subject.inspect = function(depth, opts) {
  assert.strictEqual(opts.customInspectOptions, true);
};

util.inspect(subject, { customInspectOptions: true });

// util.inspect with "colors" option should produce as many lines as without it
function test_lines(input) {
  var count_lines = function(str) {
    return (str.match(/\n/g) || []).length;
  }

  var without_color = util.inspect(input);
  var with_color = util.inspect(input, {colors: true});
  assert.equal(count_lines(without_color), count_lines(with_color));
}

test_lines([1, 2, 3, 4, 5, 6, 7]);
test_lines(function() {
  var big_array = [];
  for (var i = 0; i < 100; i++) {
    big_array.push(i);
  }
  return big_array;
}());
test_lines({foo: 'bar', baz: 35, b: {a: 35}});
test_lines({
  foo: 'bar',
  baz: 35,
  b: {a: 35},
  very_long_key: 'very_long_value',
  even_longer_key: ['with even longer value in array']
});
