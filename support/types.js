// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

'use strict';

function uncurryThis(f) {
  return f.call.bind(f);
}

var TypedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);

var TypedArrayProto_toStringTag =
    uncurryThis(
      Object.getOwnPropertyDescriptor(TypedArrayPrototype,
                                      Symbol.toStringTag).get);

exports.isArrayBufferView = ArrayBuffer.isView;

exports.isTypedArray = function(value) {
  return TypedArrayProto_toStringTag(value) !== undefined;
}

exports.isUint8Array = function(value) {
  return TypedArrayProto_toStringTag(value) === 'Uint8Array';
}

exports.isUint8ClampedArray = function(value) {
  return TypedArrayProto_toStringTag(value) === 'Uint8ClampedArray';
}

exports.isUint16Array = function(value) {
  return TypedArrayProto_toStringTag(value) === 'Uint16Array';
}

exports.isUint32Array = function(value) {
  return TypedArrayProto_toStringTag(value) === 'Uint32Array';
}

exports.isInt8Array = function(value) {
  return TypedArrayProto_toStringTag(value) === 'Int8Array';
}

exports.isInt16Array = function(value) {
  return TypedArrayProto_toStringTag(value) === 'Int16Array';
}

exports.isInt32Array = function(value) {
  return TypedArrayProto_toStringTag(value) === 'Int32Array';
}

exports.isFloat32Array = function(value) {
  return TypedArrayProto_toStringTag(value) === 'Float32Array';
}

exports.isFloat64Array = function(value) {
  return TypedArrayProto_toStringTag(value) === 'Float64Array';
}

exports.isBigInt64Array = function(value) {
  return TypedArrayProto_toStringTag(value) === 'BigInt64Array';
}

exports.isBigUint64Array = function(value) {
  return TypedArrayProto_toStringTag(value) === 'BigUint64Array';
}

var ObjectToString = uncurryThis(Object.prototype.toString);

exports.isPromise = function(value) {
  return ObjectToString(value) === '[object Promise]';
}

exports.isMap = function(value) {
  return ObjectToString(value) === '[object Map]';
}

exports.isSet = function(value) {
  return ObjectToString(value) === '[object Set]';
}

exports.isWeakMap = function(value) {
  return ObjectToString(value) === '[object WeakMap]';
}

exports.isWeakSet = function(value) {
  return ObjectToString(value) === '[object WeakSet]';
}

exports.isArrayBuffer = function(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}

exports.isDataView = function(value) {
  return ObjectToString(value) === '[object DataView]';
}

exports.isArrayBuffer = function(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}

exports.isSharedArrayBuffer = function(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}

exports.isAsyncFunction = function(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}

exports.isGeneratorFunction = function(value) {
  return ObjectToString(value) === '[object GeneratorFunction]';
};

exports.isMapIterator = function(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}

exports.isSetIterator = function(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}

exports.isAnyArrayBuffer = function(value) {
  return (
    exports.isArrayBuffer(value) ||
    exports.isSharedArrayBuffer(value)
  );
}

var numberValue = uncurryThis(Number.prototype.valueOf);
exports.isNumberObject = function(value) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    numberValue(value);
    return true;
  } catch(e) {
    return false;
  }
}

var stringValue = uncurryThis(String.prototype.valueOf);
exports.isStringObject = function(value) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    stringValue(value);
    return true;
  } catch(e) {
    return false;
  }
}

var booleanValue = uncurryThis(Boolean.prototype.valueOf);
exports.isBooleanObject = function(value) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    booleanValue(value);
    return true;
  } catch(e) {
    return false;
  }
}

var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
exports.isBigIntObject = function(value) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    bigIntValue(value);
    return true;
  } catch(e) {
    return false;
  }
}
