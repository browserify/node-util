// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

'use strict';

function uncurryThis(f) {
  return f.call.bind(f);
}

var supported = {
  BigInt: typeof BigInt !== 'undefined',
  Symbol: typeof Symbol !== 'undefined',
  Uint8Array: typeof Uint8Array !== 'undefined',
  ArrayBuffer: typeof ArrayBuffer !== 'undefined'
};

if (supported.Uint8Array) {
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

if (supported.BigInt) {
  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
}

if (supported.Symbol) {
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
    function: require('is-arguments'),
  },
  {
    name: 'isArrayBufferView',
    supported: supported.ArrayBuffer,
    function: ArrayBuffer.isView,
  },
  {
    name: 'isTypedArray',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) !== undefined;
    }
  },
  {
    name: 'isUint8Array',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'Uint8Array';
    }
  },
  {
    name: 'isUint8ClampedArray',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'Uint8ClampedArray';
    }
  },
  {
    name: 'isUint16Array',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'Uint16Array';
    }
  },
  {
    name: 'isUint32Array',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'Uint32Array';
    }
  },
  {
    name: 'isInt8Array',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'Int8Array';
    }
  },
  {
    name: 'isInt16Array',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'Int16Array';
    }
  },
  {
    name: 'isInt32Array',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'Int32Array';
    }
  },
  {
    name: 'isFloat32Array',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'Float32Array';
    }
  },
  {
    name: 'isFloat64Array',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'Float64Array';
    }
  },
  {
    name: 'isBigInt64Array',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'BigInt64Array';
    }
  },
  {
    name: 'isBigUint64Array',
    supported: supported.Uint8Array,
    function: function(value) {
      return TypedArrayProto_toStringTag(value) === 'BigUint64Array';
    }
  },
  {
    name: 'isPromise',
    function: function(value) {
      return ObjectToString(value) === '[object Promise]';
    }
  },
  {
    name: 'isMap',
    function: function(value) {
      return ObjectToString(value) === '[object Map]';
    }
  },
  {
    name: 'isSet',
    function: function(value) {
      return ObjectToString(value) === '[object Set]';
    }
  },
  {
    name: 'isWeakMap',
    function: function(value) {
      return ObjectToString(value) === '[object WeakMap]';
    }
  },
  {
    name: 'isWeakSet',
    function: function(value) {
      return ObjectToString(value) === '[object WeakSet]';
    }
  },
  {
    name: 'isArrayBuffer',
    function: function(value) {
      return ObjectToString(value) === '[object ArrayBuffer]';
    }
  },
  {
    name: 'isDataView',
    function: function(value) {
      return ObjectToString(value) === '[object DataView]';
    }
  },
  {
    name: 'isSharedArrayBuffer',
    function: function(value) {
      return ObjectToString(value) === '[object SharedArrayBuffer]';
    }
  },
  {
    name: 'isAsyncFunction',
    function: function(value) {
      return ObjectToString(value) === '[object AsyncFunction]';
    }
  },
  {
    name: 'isGeneratorFunction',
    function: function(value) {
      return ObjectToString(value) === '[object GeneratorFunction]';
    }
  },
  {
    name: 'isMapIterator',
    function: function(value) {
      return ObjectToString(value) === '[object Map Iterator]';
    }
  },
  {
    name: 'isSetIterator',
    function: function(value) {
      return ObjectToString(value) === '[object Set Iterator]';
    }
  },
  {
    name: 'isGeneratorObject',
    function: function(value) {
      return ObjectToString(value) === '[object Generator]';
    }
  },
  {
    name: 'isWebAssemblyCompiledModule',
    function: function(value) {
      return ObjectToString(value) === '[object WebAssembly.Module]';
    }
  },
  {
    name: 'isNumberObject',
    function: function(value) {
      return checkBoxedPrimitive(value, numberValue);
    }
  },
  {
    name: 'isStringObject',
    function: function(value) {
      return checkBoxedPrimitive(value, stringValue);
    }
  },
  {
    name: 'isBooleanObject',
    function: function(value) {
      return checkBoxedPrimitive(value, booleanValue);
    }
  },
  {
    name: 'isBigIntObject',
    supported: supported.BigInt,
    function: function(value) {
      return checkBoxedPrimitive(value, bigIntValue);
    }
  },
  {
    name: 'isSymbolObject',
    supported: supported.Symbol,
    function: function(value) {
      return checkBoxedPrimitive(value, symbolValue);
    }
  },
  {
    name: 'isBoxedPrimitive',
    function: function(value) {
      return (
        exports.isNumberObject(value) ||
        exports.isStringObject(value) ||
        exports.isBooleanObject(value) ||
        (supported.BigInt && exports.isBigIntObject(value)) ||
        (supported.Symbol && exports.isSymbolObject(value))
      );
    }
  },
  {
    name: 'isAnyArrayBuffer',
    supported: supported.Uint8Array,
    function: function(value) {
      return (
        exports.isArrayBuffer(value) ||
        exports.isSharedArrayBuffer(value)
      );
    }
  },
  {
    name: 'isProxy',
    supported: false
  },
  {
    name: 'isExternal',
    supported: false
  },
  {
    name: 'isModuleNamespaceObject',
    supported: false
  },
];

methods.forEach(function(method) {
  const supported = method.supported !== false;
  Object.defineProperty(exports, method.name, {
    enumerable: supported,
    value: supported ? method.function : function() {
      throw new Error(method.name + ' is not supported');
    }
  });
});
