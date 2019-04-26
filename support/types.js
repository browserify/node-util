// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

'use strict';

var isArgumentsObject = require('is-arguments');
var isGeneratorFunction = require('is-generator-function');

function uncurryThis(f) {
  return f.call.bind(f);
}

var BigIntSupported = typeof BigInt !== 'undefined';
var SymbolSupported = typeof Symbol !== 'undefined';
var SymbolToStringTagSupported = SymbolSupported && typeof Symbol.toStringTag !== 'undefined';
var Uint8ArraySupported = typeof Uint8Array !== 'undefined';
var ArrayBufferSupported = typeof ArrayBuffer !== 'undefined';

if (Uint8ArraySupported && SymbolToStringTagSupported) {
  var TypedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);

  var TypedArrayProto_toStringTag =
      uncurryThis(
        Object.getOwnPropertyDescriptor(TypedArrayPrototype,
                                        Symbol.toStringTag).get);

}

var ObjectToString = uncurryThis(Object.prototype.toString);

var numberValue = uncurryThis(Number.prototype.valueOf);
var stringValue = uncurryThis(String.prototype.valueOf);
var booleanValue = uncurryThis(Boolean.prototype.valueOf);

if (BigIntSupported) {
  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
}

if (SymbolSupported) {
  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
}

function checkBoxedPrimitive(value, prototypeValueOf) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    prototypeValueOf(value);
    return true;
  } catch(e) {
    return false;
  }
}

function isArgumentsObject(value) {
  return isArguments(value);
}
exports.isArgumentsObject = isArgumentsObject;

exports.isGeneratorFunction = isGeneratorFunction;

function isArrayBufferView(value) {
  return ArrayBufferSupported && ArrayBuffer.isView(value);
}
exports.isArrayBufferView = isArrayBufferView;

function isTypedArray(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) !== undefined;
  } else {
    return ObjectToString(value) === '[object TypedArray]';
  }
}
exports.isTypedArray = isTypedArray;

function isUint8Array(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'Uint8Array';
  } else {
    return ObjectToString(value) === '[object Uint8Array]';
  }
}
exports.isUint8Array = isUint8Array;

function isUint8ClampedArray(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'Uint8ClampedArray';
  } else {
    return ObjectToString(value) === '[object Uint8ClampedArray]';
  }
}
exports.isUint8ClampedArray = isUint8ClampedArray;

function isUint16Array(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'Uint16Array';
  } else {
    return ObjectToString(value) === '[object Uint16Array]';
  }
}
exports.isUint16Array = isUint16Array;

function isUint32Array(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'Uint32Array';
  } else {
    return ObjectToString(value) === '[object Uint32Array]';
  }
}
exports.isUint32Array = isUint32Array;

function isInt8Array(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'Int8Array';
  } else {
    return ObjectToString(value) === '[object Int8Array]';
  }
}
exports.isInt8Array = isInt8Array;

function isInt16Array(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'Int16Array';
  } else {
    return ObjectToString(value) === '[object Int16Array]';
  }
}
exports.isInt16Array = isInt16Array;

function isInt32Array(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'Int32Array';
  } else {
    return ObjectToString(value) === '[object Int32Array]';
  }
}
exports.isInt32Array = isInt32Array;

function isFloat32Array(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'Float32Array';
  } else {
    return ObjectToString(value) === '[object Float32Array]';
  }
}
exports.isFloat32Array = isFloat32Array;

function isFloat64Array(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'Float64Array';
  } else {
    return ObjectToString(value) === '[object Float64Array]';
  }
}
exports.isFloat64Array = isFloat64Array;

function isBigInt64Array(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'BigInt64Array';
  } else {
    return ObjectToString(value) === '[object BigInt64Array]';
  }
}
exports.isBigInt64Array = isBigInt64Array;

function isBigUint64Array(value) {
  if (Uint8ArraySupported && SymbolToStringTagSupported) {
    return TypedArrayProto_toStringTag(value) === 'BigUint64Array';
  } else {
    return ObjectToString(value) === '[object BigUint64Array]';
  }
}
exports.isBigUint64Array = isBigUint64Array;

function isPromise(value) {
  return ObjectToString(value) === '[object Promise]';
}
exports.isPromise = isPromise;

function isMap(value) {
  return ObjectToString(value) === '[object Map]';
}
exports.isMap = isMap;

function isSet(value) {
  return ObjectToString(value) === '[object Set]';
}
exports.isSet = isSet;

function isWeakMap(value) {
  return ObjectToString(value) === '[object WeakMap]';
}
exports.isWeakMap = isWeakMap;

function isWeakSet(value) {
  return ObjectToString(value) === '[object WeakSet]';
}
exports.isWeakSet = isWeakSet;

function isArrayBuffer(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}
exports.isArrayBuffer = isArrayBuffer;

function isDataView(value) {
  return ObjectToString(value) === '[object DataView]';
}
exports.isDataView = isDataView;

function isSharedArrayBuffer(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}
exports.isSharedArrayBuffer = isSharedArrayBuffer;

function isAsyncFunction(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}
exports.isAsyncFunction = isAsyncFunction;

function isMapIterator(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}
exports.isMapIterator = isMapIterator;

function isSetIterator(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}
exports.isSetIterator = isSetIterator;

function isGeneratorObject(value) {
  return ObjectToString(value) === '[object Generator]';
}
exports.isGeneratorObject = isGeneratorObject;

function isWebAssemblyCompiledModule(value) {
  return ObjectToString(value) === '[object WebAssembly.Module]';
}
exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

function isNumberObject(value) {
  return checkBoxedPrimitive(value, numberValue);
}
exports.isNumberObject = isNumberObject;

function isStringObject(value) {
  return checkBoxedPrimitive(value, stringValue);
}
exports.isStringObject = isStringObject;

function isBooleanObject(value) {
  return checkBoxedPrimitive(value, booleanValue);
}
exports.isBooleanObject = isBooleanObject;

function isBigIntObject(value) {
  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
}
exports.isBigIntObject = isBigIntObject;

function isSymbolObject(value) {
  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
}
exports.isSymbolObject = isSymbolObject;

function isBoxedPrimitive(value) {
  return (
    isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
  );
}
exports.isBoxedPrimitive = isBoxedPrimitive;

function isAnyArrayBuffer(value) {
  return Uint8ArraySupported && (
    isArrayBuffer(value) ||
    isSharedArrayBuffer(value)
  );
}
exports.isAnyArrayBuffer = isAnyArrayBuffer;

['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
  Object.defineProperty(exports, method, {
    enumerable: false,
    value: function() {
      throw new Error(method + ' is not supported in userland');
    }
  });
});
