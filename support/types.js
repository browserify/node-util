// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

'use strict';

var isArgumentsObject = require('is-arguments');

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

var methods = [
  {
    name: 'isArgumentsObject',
    function: isArgumentsObject
  },
  {
    name: 'isArrayBufferView',
    function: function isArrayBufferView(value) {
      return ArrayBufferSupported && ArrayBuffer.isView(value);
    },
  },
  {
    name: 'isTypedArray',
    function: function isTypedArray(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) !== undefined;
      } else {
        return ObjectToString(value) === '[object TypedArray]';
      }
    }
  },
  {
    name: 'isUint8Array',
    function: function isUint8Array(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'Uint8Array';
      } else {
        return ObjectToString(value) === '[object Uint8Array]';
      }
    }
  },
  {
    name: 'isUint8ClampedArray',
    function: function isUint8ClampedArray(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'Uint8ClampedArray';
      } else {
        return ObjectToString(value) === '[object Uint8ClampedArray]';
      }
    }
  },
  {
    name: 'isUint16Array',
    function: function isUint16Array(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'Uint16Array';
      } else {
        return ObjectToString(value) === '[object Uint16Array]';
      }
    }
  },
  {
    name: 'isUint32Array',
    function: function isUint32Array(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'Uint32Array';
      } else {
        return ObjectToString(value) === '[object Uint32Array]';
      }
    }
  },
  {
    name: 'isInt8Array',
    function: function isInt8Array(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'Int8Array';
      } else {
        return ObjectToString(value) === '[object Int8Array]';
      }
    }
  },
  {
    name: 'isInt16Array',
    function: function isInt16Array(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'Int16Array';
      } else {
        return ObjectToString(value) === '[object Int16Array]';
      }
    }
  },
  {
    name: 'isInt32Array',
    function: function isInt32Array(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'Int32Array';
      } else {
        return ObjectToString(value) === '[object Int32Array]';
      }
    }
  },
  {
    name: 'isFloat32Array',
    function: function isFloat32Array(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'Float32Array';
      } else {
        return ObjectToString(value) === '[object Float32Array]';
      }
    }
  },
  {
    name: 'isFloat64Array',
    function: function isFloat64Array(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'Float64Array';
      } else {
        return ObjectToString(value) === '[object Float64Array]';
      }
    }
  },
  {
    name: 'isBigInt64Array',
    function: function isBigInt64Array(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'BigInt64Array';
      } else {
        return ObjectToString(value) === '[object BigInt64Array]';
      }
    }
  },
  {
    name: 'isBigUint64Array',
    function: function isBigUint64Array(value) {
      if (Uint8ArraySupported && SymbolToStringTagSupported) {
        return TypedArrayProto_toStringTag(value) === 'BigUint64Array';
      } else {
        return ObjectToString(value) === '[object BigUint64Array]';
      }
    }
  },
  {
    name: 'isPromise',
    function: function isPromise(value) {
      return ObjectToString(value) === '[object Promise]';
    }
  },
  {
    name: 'isMap',
    function: function isMap(value) {
      return ObjectToString(value) === '[object Map]';
    }
  },
  {
    name: 'isSet',
    function: function isSet(value) {
      return ObjectToString(value) === '[object Set]';
    }
  },
  {
    name: 'isWeakMap',
    function: function isWeakMap(value) {
      return ObjectToString(value) === '[object WeakMap]';
    }
  },
  {
    name: 'isWeakSet',
    function: function isWeakSet(value) {
      return ObjectToString(value) === '[object WeakSet]';
    }
  },
  {
    name: 'isArrayBuffer',
    function: function isArrayBuffer(value) {
      return ObjectToString(value) === '[object ArrayBuffer]';
    }
  },
  {
    name: 'isDataView',
    function: function isDataView(value) {
      return ObjectToString(value) === '[object DataView]';
    }
  },
  {
    name: 'isSharedArrayBuffer',
    function: function isSharedArrayBuffer(value) {
      return ObjectToString(value) === '[object SharedArrayBuffer]';
    }
  },
  {
    name: 'isAsyncFunction',
    function: function isAsyncFunction(value) {
      return ObjectToString(value) === '[object AsyncFunction]';
    }
  },
  {
    name: 'isGeneratorFunction',
    function: function isGeneratorFunction(value) {
      return ObjectToString(value) === '[object GeneratorFunction]';
    }
  },
  {
    name: 'isMapIterator',
    function: function isMapIterator(value) {
      return ObjectToString(value) === '[object Map Iterator]';
    }
  },
  {
    name: 'isSetIterator',
    function: function isSetIterator(value) {
      return ObjectToString(value) === '[object Set Iterator]';
    }
  },
  {
    name: 'isGeneratorObject',
    function: function isGeneratorObject(value) {
      return ObjectToString(value) === '[object Generator]';
    }
  },
  {
    name: 'isWebAssemblyCompiledModule',
    function: function isWebAssemblyCompiledModule(value) {
      return ObjectToString(value) === '[object WebAssembly.Module]';
    }
  },
  {
    name: 'isNumberObject',
    function: function isNumberObject(value) {
      return checkBoxedPrimitive(value, numberValue);
    }
  },
  {
    name: 'isStringObject',
    function: function isStringObject(value) {
      return checkBoxedPrimitive(value, stringValue);
    }
  },
  {
    name: 'isBooleanObject',
    function: function isBooleanObject(value) {
      return checkBoxedPrimitive(value, booleanValue);
    }
  },
  {
    name: 'isBigIntObject',
    function: function isBigIntObject(value) {
      return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
    }
  },
  {
    name: 'isSymbolObject',
    function: function isSymbolObject(value) {
      return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
    }
  },
  {
    name: 'isBoxedPrimitive',
    function: function isBoxedPrimitive(value) {
      return (
        exports.isNumberObject(value) ||
        exports.isStringObject(value) ||
        exports.isBooleanObject(value) ||
        exports.isBigIntObject(value) ||
        exports.isSymbolObject(value)
      );
    }
  },
  {
    name: 'isAnyArrayBuffer',
    function: function isAnyArrayBuffer(value) {
      return Uint8ArraySupported && (
        exports.isArrayBuffer(value) ||
        exports.isSharedArrayBuffer(value)
      );
    }
  },
  {
    name: 'isProxy',
    disabled: true
  },
  {
    name: 'isExternal',
    disabled: true
  },
  {
    name: 'isModuleNamespaceObject',
    disabled: true
  },
];

methods.forEach(function(method) {
  Object.defineProperty(exports, method.name, {
    enumerable: !method.disabled,
    value: !method.disabled ? method.function : function() {
      throw new Error(method.name + ' is not supported in userland');
    }
  });
});
