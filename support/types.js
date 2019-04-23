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

// Cached to make sure no userland code can tamper with it.
var isArrayBufferView = ArrayBuffer.isView;

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
