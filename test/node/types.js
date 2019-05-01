// Currently in sync with Node.js test/parallel/test-util-types.js
// https://github.com/nodejs/node/commit/519a11b24fa453e5cefe13df10ab9696616b5b91

// Flags: --experimental-vm-modules --expose-internals
'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }
function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('./common');
var assert = require('assert');
var _require = require('../../'),
    types = _require.types;
var vm = require('vm');

var Buffer = require('safe-buffer').Buffer
var objectEntries = require('object.entries');

// "polyfill" deepStrictEqual on Node 0.12 and below
if (!assert.deepStrictEqual) {
  assert.deepStrictEqual = assert.deepEqual;
}

function uncurryThis(f) {
  return f.call.bind(f);
}

var ObjectToString = uncurryThis(Object.prototype.toString);

var inspect = function inspect(value) {
  try {
    return JSON.stringify(value);
  } catch (e) {
    return ObjectToString(value);
  }
};

// [browserify] We can't test this in userland
// const { internalBinding } = require('internal/test/binding');
// const { JSStream } = internalBinding('js_stream');
// const external = (new JSStream())._externalStream;

var wasmBuffer = Buffer.from('0061736d01000000', 'hex');

for (var _i = 0, _arr = [
  // [ external, 'isExternal' ],
  [function () { return new Date(); }, 'isDate'],
  [function () { return function () { return arguments; }(); }, 'isArgumentsObject'],
  [function () { return new Boolean(); }, 'isBooleanObject'],
  [function () { return new Number(); }, 'isNumberObject'],
  [function () { return new String(); }, 'isStringObject'],
  [function () { return Object(Symbol()); }, 'isSymbolObject'],
  [function () { return Object(BigInt(0)); }, 'isBigIntObject'],
  [function () { return new Error(); }, 'isNativeError'],
  [function () { return new RegExp(); }, 'isRegExp'],
  [function () { return eval('(async function() {})'); }, 'isAsyncFunction'],
  [function () { return eval('(function*() {})') }, 'isGeneratorFunction'],
  [function () { return eval('((function*() {})())') }, 'isGeneratorObject'],
  [function () { return Promise.resolve(); }, 'isPromise'],
  [function () { return new Map(); }, 'isMap'],
  [function () { return new Set(); }, 'isSet'],
  [function () { return new Map()[Symbol.iterator](); }, 'isMapIterator'],
  [function () { return new Set()[Symbol.iterator](); }, 'isSetIterator'],
  [function () { return new WeakMap(); }, 'isWeakMap'],
  [function () { return new WeakSet(); }, 'isWeakSet'],
  [function () { return new ArrayBuffer(1); }, 'isArrayBuffer'],
  [function () { return new Uint8Array(); }, 'isUint8Array'],
  [function () { return new Uint8ClampedArray(); }, 'isUint8ClampedArray'],
  [function () { return new Uint16Array(); }, 'isUint16Array'],
  [function () { return new Uint32Array(); }, 'isUint32Array'],
  [function () { return new Int8Array(); }, 'isInt8Array'],
  [function () { return new Int16Array(); }, 'isInt16Array'],
  [function () { return new Int32Array(); }, 'isInt32Array'],
  [function () { return new Float32Array(); }, 'isFloat32Array'],
  [function () { return new Float64Array(); }, 'isFloat64Array'],
  [function () { return new BigInt64Array(); }, 'isBigInt64Array'],
  [function () { return new BigUint64Array(); }, 'isBigUint64Array'],
  [function () {
    if (typeof Symbol === 'undefined' || typeof Symbol.toStringTag === 'undefined') {
      throw Error();
    }

    return Object.defineProperty(new Uint8Array(), Symbol.toStringTag, {
      value: 'foo'
    });
  }, 'isUint8Array'],
  [function () { return new DataView(new ArrayBuffer(1), 0, 1); }, 'isDataView'],
  [function () { return new SharedArrayBuffer(); }, 'isSharedArrayBuffer'],
  // [ new Proxy({}, {}), 'isProxy' ],
  [function () { return new WebAssembly.Module(wasmBuffer); }, 'isWebAssemblyCompiledModule']
]; _i < _arr.length; _i++) {
  var _arr$_i = _slicedToArray(_arr[_i], 2),
      getValue = _arr$_i[0],
      method = _arr$_i[1];

  var _value = void 0;
  try {
    _value = getValue();
  } catch (e) {
    console.log('Skipping unsupported type:', getValue);
    continue;
  }
  console.log('Testing', method);
  assert(method in types, "Missing ".concat(method, " for ").concat(inspect(_value)));
  assert(types[method](_value), "Want ".concat(inspect(_value), " to match ").concat(method));

  for (var _i3 = 0, _Object$keys2 = Object.keys(types); _i3 < _Object$keys2.length; _i3++) {
    var key = _Object$keys2[_i3];
    if ((types.isArrayBufferView(_value) ||
         types.isAnyArrayBuffer(_value)) && key.indexOf('Array') > -1 ||
         key === 'isBoxedPrimitive') {
      continue;
    }

    assert.strictEqual(types[key](_value),
                       key === method,
                       "".concat(inspect(_value), ": ").concat(key, ", ") +
                       "".concat(method, ", ").concat(types[key](_value)));
  }
}

// Check boxed primitives.
console.log('Testing', 'isBoxedPrimitive');
[
  function () { return new Boolean(); },
  function () { return new Number(); },
  function () { return new String(); },
  function () { return Object(Symbol()); },
  function () { return Object(BigInt(0)); }
].forEach(function (getEntry) {
  var entry;
  try {
    entry = getEntry();
  } catch (e) {
    return;
  }
  assert(types.isBoxedPrimitive(entry));
});

var SymbolSupported = typeof Symbol !== 'undefined';
var SymbolToStringTagSupported = SymbolSupported && typeof Symbol.toStringTag !== 'undefined';
var isBuggyFirefox = typeof navigator !== 'undefined' && /Firefox\/\d+/.test(navigator.userAgent) &&
  parseInt(navigator.userAgent.split('Firefox/')[1], 10) < 66
if (SymbolToStringTagSupported && !isBuggyFirefox) {
  [
    'Uint8Array',
    'Uint8ClampedArray',
    'Uint16Array',
    'Uint32Array',
    'Int8Array',
    'Int16Array',
    'Int32Array',
    'Float32Array',
    'Float64Array',
    'BigInt64Array',
    'BigUint64Array'
  ].forEach(function (typedArray) {
    var method = 'is' + typedArray;
    var constructor = 'new ' + typedArray;
    var array;
    try {
      array = vm.runInNewContext(constructor);
    } catch (e) {
      return;
    }
    console.log('Testing fake typed arrays', method);
    assert(!types[method](_defineProperty({}, Symbol.toStringTag, typedArray)));
    assert(types[method](array));
  });
}
if (isBuggyFirefox) {
  console.log('skipping fake typed array tests because they do not work in FF')
}

// Old Node.js had a fully custom Buffer implementation, newer are based on ArrayBuffer
// This is important for the ArrayBuffer and typed array tests
var isBufferBasedOnArrayBuffer = Buffer.alloc(1).buffer !== undefined;
{
  var primitive = function primitive() { return true; };
  var arrayBuffer = function arrayBuffer() { return new ArrayBuffer(1); };

  var buffer = function buffer() { return Buffer.from(arrayBuffer()); };
  var dataView = function dataView() { return new DataView(arrayBuffer(), 0, 1); };
  var uint8Array = function uint8Array() { return new Uint8Array(arrayBuffer()); };
  var uint8ClampedArray = function uint8ClampedArray() { return new Uint8ClampedArray(arrayBuffer()); };
  var uint16Array = function uint16Array() { return new Uint16Array(arrayBuffer()); };
  var uint32Array = function uint32Array() { return new Uint32Array(arrayBuffer()); };
  var int8Array = function int8Array() { return new Int8Array(arrayBuffer()); };
  var int16Array = function int16Array() { return new Int16Array(arrayBuffer()); };
  var int32Array = function int32Array() { return new Int32Array(arrayBuffer()); };
  var float32Array = function float32Array() { return new Float32Array(arrayBuffer()); };
  var float64Array = function float64Array() { return new Float64Array(arrayBuffer()); };
  var bigInt64Array = function bigInt64Array() { return new BigInt64Array(arrayBuffer()); };
  var bigUint64Array = function bigUint64Array() { return new BigUint64Array(arrayBuffer()); };

  var fakeBuffer = function fakeBuffer() {
    if (!SymbolToStringTagSupported) {
      throw new Error();
    }
    return Object.create(Buffer.prototype);
  };
  var fakeDataView = function fakeDataView() {
    if (!SymbolToStringTagSupported) {
      throw new Error();
    }
    return Object.create(DataView.prototype);
  };
  var fakeUint8Array = function fakeUint8Array() { return Object.create(Uint8Array.prototype); };
  var fakeUint8ClampedArray = function fakeUint8ClampedArray() { return Object.create(Uint8ClampedArray.prototype); };
  var fakeUint16Array = function fakeUint16Array() { return Object.create(Uint16Array.prototype); };
  var fakeUint32Array = function fakeUint32Array() { return Object.create(Uint32Array.prototype); };
  var fakeInt8Array = function fakeInt8Array() { return Object.create(Int8Array.prototype); };
  var fakeInt16Array = function fakeInt16Array() { return Object.create(Int16Array.prototype); };
  var fakeInt32Array = function fakeInt32Array() { return Object.create(Int32Array.prototype); };
  var fakeFloat32Array = function fakeFloat32Array() { return Object.create(Float32Array.prototype); };
  var fakeFloat64Array = function fakeFloat64Array() { return Object.create(Float64Array.prototype); };
  var fakeBigInt64Array = function fakeBigInt64Array() { return Object.create(BigInt64Array.prototype); };
  var fakeBigUint64Array = function fakeBigUint64Array() { return Object.create(BigUint64Array.prototype); };

  var stealthyDataView = function stealthyDataView() {
    return Object.setPrototypeOf(new DataView(arrayBuffer(), 0, 1), Uint8Array.prototype);
  };
  var stealthyUint8Array = function stealthyUint8Array() {
    return Object.setPrototypeOf(new Uint8Array(arrayBuffer()), ArrayBuffer.prototype);
  };
  var stealthyUint8ClampedArray = function stealthyUint8ClampedArray() {
    return Object.setPrototypeOf(new Uint8ClampedArray(arrayBuffer()), ArrayBuffer.prototype);
  };
  var stealthyUint16Array = function stealthyUint16Array() {
    return Object.setPrototypeOf(new Uint16Array(arrayBuffer()), Uint16Array.prototype);
  };
  var stealthyUint32Array = function stealthyUint32Array() {
    return Object.setPrototypeOf(new Uint32Array(arrayBuffer()), Uint32Array.prototype);
  };
  var stealthyInt8Array = function stealthyInt8Array() {
    return Object.setPrototypeOf(new Int8Array(arrayBuffer()), Int8Array.prototype);
  };
  var stealthyInt16Array = function stealthyInt16Array() {
    return Object.setPrototypeOf(new Int16Array(arrayBuffer()), Int16Array.prototype);
  };
  var stealthyInt32Array = function stealthyInt32Array() {
    return Object.setPrototypeOf(new Int32Array(arrayBuffer()), Int32Array.prototype);
  };
  var stealthyFloat32Array = function stealthyFloat32Array() {
    return Object.setPrototypeOf(new Float32Array(arrayBuffer()), Float32Array.prototype);
  };
  var stealthyFloat64Array = function stealthyFloat64Array() {
    return Object.setPrototypeOf(new Float64Array(arrayBuffer()), Float64Array.prototype);
  };
  var stealthyBigInt64Array = function stealthyBigInt64Array() {
    return Object.setPrototypeOf(new BigInt64Array(arrayBuffer()), BigInt64Array.prototype);
  };
  var stealthyBigUint64Array = function stealthyBigUint64Array() {
    return Object.setPrototypeOf(new BigUint64Array(arrayBuffer()), BigUint64Array.prototype);
  };

  var typedArrays = objectEntries({
    primitive: primitive,
    arrayBuffer: arrayBuffer,
    buffer: buffer,
    fakeBuffer: fakeBuffer,
    dataView: dataView,
    fakeDataView: fakeDataView,
    stealthyDataView: stealthyDataView,
    uint8Array: uint8Array,
    fakeUint8Array: fakeUint8Array,
    stealthyUint8Array: stealthyUint8Array,
    uint8ClampedArray: uint8ClampedArray,
    fakeUint8ClampedArray: fakeUint8ClampedArray,
    stealthyUint8ClampedArray: stealthyUint8ClampedArray,
    uint16Array: uint16Array,
    fakeUint16Array: fakeUint16Array,
    stealthyUint16Array: stealthyUint16Array,
    uint32Array: uint32Array,
    fakeUint32Array: fakeUint32Array,
    stealthyUint32Array: stealthyUint32Array,
    int8Array: int8Array,
    fakeInt8Array: fakeInt8Array,
    stealthyInt8Array: stealthyInt8Array,
    int16Array: int16Array,
    fakeInt16Array: fakeInt16Array,
    stealthyInt16Array: stealthyInt16Array,
    int32Array: int32Array,
    fakeInt32Array: fakeInt32Array,
    stealthyInt32Array: stealthyInt32Array,
    float32Array: float32Array,
    fakeFloat32Array: fakeFloat32Array,
    stealthyFloat32Array: stealthyFloat32Array,
    float64Array: float64Array,
    fakeFloat64Array: fakeFloat64Array,
    stealthyFloat64Array: stealthyFloat64Array,
    bigInt64Array: bigInt64Array,
    fakeBigInt64Array: fakeBigInt64Array,
    stealthyBigInt64Array: stealthyBigInt64Array,
    bigUint64Array: bigUint64Array,
    fakeBigUint64Array: fakeBigUint64Array,
    stealthyBigUint64Array: stealthyBigUint64Array
  });
  typedArrays.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        createTypedArray = _ref2[1];

    try {
      typedArrays[key] = createTypedArray();
    } catch (e) {
      typedArrays[key] = undefined;
    }
  });

  primitive = typedArrays.primitive;
  arrayBuffer = typedArrays.arrayBuffer;
  buffer = typedArrays.buffer;
  fakeBuffer = typedArrays.fakeBuffer;
  dataView = typedArrays.dataView;
  fakeDataView = typedArrays.fakeDataView;
  stealthyDataView = typedArrays.stealthyDataView;
  uint8Array = typedArrays.uint8Array;
  fakeUint8Array = typedArrays.fakeUint8Array;
  stealthyUint8Array = typedArrays.stealthyUint8Array;
  uint8ClampedArray = typedArrays.uint8ClampedArray;
  fakeUint8ClampedArray = typedArrays.fakeUint8ClampedArray;
  stealthyUint8ClampedArray = typedArrays.stealthyUint8ClampedArray;
  uint16Array = typedArrays.uint16Array;
  fakeUint16Array = typedArrays.fakeUint16Array;
  stealthyUint16Array = typedArrays.stealthyUint16Array;
  uint32Array = typedArrays.uint32Array;
  fakeUint32Array = typedArrays.fakeUint32Array;
  stealthyUint32Array = typedArrays.stealthyUint32Array;
  int8Array = typedArrays.int8Array;
  fakeInt8Array = typedArrays.fakeInt8Array;
  stealthyInt8Array = typedArrays.stealthyInt8Array;
  int16Array = typedArrays.int16Array;
  fakeInt16Array = typedArrays.fakeInt16Array;
  stealthyInt16Array = typedArrays.stealthyInt16Array;
  int32Array = typedArrays.int32Array;
  fakeInt32Array = typedArrays.fakeInt32Array;
  stealthyInt32Array = typedArrays.stealthyInt32Array;
  float32Array = typedArrays.float32Array;
  fakeFloat32Array = typedArrays.fakeFloat32Array;
  stealthyFloat32Array = typedArrays.stealthyFloat32Array;
  float64Array = typedArrays.float64Array;
  fakeFloat64Array = typedArrays.fakeFloat64Array;
  stealthyFloat64Array = typedArrays.stealthyFloat64Array;
  bigInt64Array = typedArrays.bigInt64Array;
  fakeBigInt64Array = typedArrays.fakeBigInt64Array;
  stealthyBigInt64Array = typedArrays.stealthyBigInt64Array;
  bigUint64Array = typedArrays.bigUint64Array;
  fakeBigUint64Array = typedArrays.fakeBigUint64Array;
  stealthyBigUint64Array = typedArrays.stealthyBigUint64Array;

  var all = [
    primitive,
    arrayBuffer,
    buffer,
    fakeBuffer,
    dataView,
    fakeDataView,
    stealthyDataView,
    uint8Array,
    fakeUint8Array,
    stealthyUint8Array,
    uint8ClampedArray,
    fakeUint8ClampedArray,
    stealthyUint8ClampedArray,
    uint16Array,
    fakeUint16Array,
    stealthyUint16Array,
    uint32Array,
    fakeUint32Array,
    stealthyUint32Array,
    int8Array,
    fakeInt8Array,
    stealthyInt8Array,
    int16Array,
    fakeInt16Array,
    stealthyInt16Array,
    int32Array,
    fakeInt32Array,
    stealthyInt32Array,
    float32Array,
    fakeFloat32Array,
    stealthyFloat32Array,
    float64Array,
    fakeFloat64Array,
    stealthyFloat64Array,
    bigInt64Array,
    fakeBigInt64Array,
    stealthyBigInt64Array,
    bigUint64Array,
    fakeBigUint64Array,
    stealthyBigUint64Array
  ];

  var expected = {
    isArrayBufferView: [
      isBufferBasedOnArrayBuffer ? buffer : undefined,
      dataView,
      stealthyDataView,
      uint8Array,
      stealthyUint8Array,
      uint8ClampedArray,
      stealthyUint8ClampedArray,
      uint16Array,
      stealthyUint16Array,
      uint32Array,
      stealthyUint32Array,
      int8Array,
      stealthyInt8Array,
      int16Array,
      stealthyInt16Array,
      int32Array,
      stealthyInt32Array,
      float32Array,
      stealthyFloat32Array,
      float64Array,
      stealthyFloat64Array,
      bigInt64Array,
      stealthyBigInt64Array,
      bigUint64Array,
      stealthyBigUint64Array
    ],
    isTypedArray: [
      isBufferBasedOnArrayBuffer ? buffer : undefined,
      uint8Array,
      stealthyUint8Array,
      uint8ClampedArray,
      stealthyUint8ClampedArray,
      uint16Array,
      stealthyUint16Array,
      uint32Array,
      stealthyUint32Array,
      int8Array,
      stealthyInt8Array,
      int16Array,
      stealthyInt16Array,
      int32Array,
      stealthyInt32Array,
      float32Array,
      stealthyFloat32Array,
      float64Array,
      stealthyFloat64Array,
      bigInt64Array,
      stealthyBigInt64Array,
      bigUint64Array,
      stealthyBigUint64Array
    ],
    isUint8Array: [
      isBufferBasedOnArrayBuffer ? buffer : undefined,
      uint8Array,
      stealthyUint8Array
    ],
    isUint8ClampedArray: [
      uint8ClampedArray,
      stealthyUint8ClampedArray
    ],
    isUint16Array: [
      uint16Array,
      stealthyUint16Array
    ],
    isUint32Array: [
      uint32Array,
      stealthyUint32Array
    ],
    isInt8Array: [
      int8Array,
      stealthyInt8Array
    ],
    isInt16Array: [
      int16Array,
      stealthyInt16Array
    ],
    isInt32Array: [
      int32Array,
      stealthyInt32Array
    ],
    isFloat32Array: [
      float32Array,
      stealthyFloat32Array
    ],
    isFloat64Array: [
      float64Array,
      stealthyFloat64Array
    ],
    isBigInt64Array: [
      bigInt64Array,
      stealthyBigInt64Array
    ],
    isBigUint64Array: [
      bigUint64Array,
      stealthyBigUint64Array
    ]
  };

  Object.keys(expected).forEach(function (testedFunc) {
    console.log('Testing values for:', testedFunc);
    var func = types[testedFunc];
    var yup = [];

    all
      .filter(function (a) { return typeof a !== 'undefined'; })
      .forEach(function (value) {
        if (func(value)) {
          yup.push(value);
        }
      });

    assert.deepStrictEqual(
      yup,
      expected[testedFunc].filter(function (a) { return typeof a !== 'undefined'; })
    );
  });
}

// (async () => {
//   const m = new vm.SourceTextModule('');
//   await m.link(() => 0);
//   m.instantiate();
//   await m.evaluate();
//   assert.ok(types.isModuleNamespaceObject(m.namespace));
// })();
