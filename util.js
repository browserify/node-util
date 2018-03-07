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

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var internalUtil = require('./internal/util');
var removeColors = internalUtil.removeColors;
var getConstructorOf = internalUtil.getConstructorOf;
var isTypedArray = require('is-typed-array');

var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
var regExpToString = RegExp.prototype.toString;
var dateToISOString = Date.prototype.toISOString;
var errorToString = Error.prototype.toString;

var strEscapeSequencesRegExp = /[\x00-\x1f\x27\x5c]/;
var strEscapeSequencesReplacer = /[\x00-\x1f\x27\x5c]/g;
var keyStrRegExp = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
var numberRegExp = /^(0|[1-9][0-9]*)$/;

function isSet(obj) {
  return objectToString(obj) === '[object Set]';
}
function isMap(obj) {
  return objectToString(obj) === '[object Map]';
}
function isSetIterator(obj) {
  return objectToString(obj) === '[object Set Iterator]';
}
function isMapIterator(obj) {
  return objectToString(obj) === '[object Map Iterator]';
}
function isAnyArrayBuffer(obj) {
  return objectToString(obj) === '[object ArrayBuffer]' ||
    objectToString(obj) ===  '[object SharedArrayBuffer]';
}
function isDataView(obj) {
  return objectToString(obj) === '[object DataView]';
}
function isPromise(obj) {
  return objectToString(obj) === '[object Promise]';
}

// Escaped special characters. Use empty strings to fill up unused entries.
var meta = [
  '\\u0000', '\\u0001', '\\u0002', '\\u0003', '\\u0004',
  '\\u0005', '\\u0006', '\\u0007', '\\b', '\\t',
  '\\n', '\\u000b', '\\f', '\\r', '\\u000e',
  '\\u000f', '\\u0010', '\\u0011', '\\u0012', '\\u0013',
  '\\u0014', '\\u0015', '\\u0016', '\\u0017', '\\u0018',
  '\\u0019', '\\u001a', '\\u001b', '\\u001c', '\\u001d',
  '\\u001e', '\\u001f', '', '', '',
  '', '', '', '', "\\'", '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '\\\\'
];

function escapeFn (str) {
  return meta[str.charCodeAt(0)];
}

// Escape control characters, single quotes and the backslash.
// This is similar to JSON stringify escaping.
function strEscape(str) {
  // Some magic numbers that worked out fine while benchmarking with v8 6.0
  if (str.length < 5000 && !strEscapeSequencesRegExp.test(str))
    return '\'' + str + '\'';
  if (str.length > 100)
    return '\'' + str.replace(strEscapeSequencesReplacer, escapeFn) + '\'';
  var result = '';
  var last = 0;
  for (var i = 0; i < str.length; i++) {
    var point = str.charCodeAt(i);
    if (point === 39 || point === 92 || point < 32) {
      if (last === i) {
        result += meta[point];
      } else {
        result += str.slice(last, i) + meta[point];
      }
      last = i + 1;
    }
  }
  if (last === 0) {
    result = str;
  } else if (last !== i) {
    result += str.slice(last);
  }
  return '\'' + result + '\'';
}

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};

var customInspectSymbol = typeof Symbol !== 'undefined' ? Symbol('util.inspect.custom') : undefined;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    maxArrayLength: 100,
    breakLength: 60,
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;
inspect.custom = customInspectSymbol;

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}

function formatValue(ctx, value, recurseTimes, ln) {
  // Primitive types cannot have properties
  if (typeof value !== 'object' && typeof value !== 'function') {
    return formatPrimitive(ctx.stylize, value);
  }
  if (value === null) {
    return ctx.stylize('null', 'null');
  }

  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect && customInspectSymbol) {
    var maybeCustomInspect = value[customInspectSymbol] || value.inspect;

    if (typeof maybeCustomInspect === 'function' &&
        // Filter out the util module, its inspect function is special
        maybeCustomInspect !== exports.inspect &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      var ret = maybeCustomInspect.call(value, recurseTimes, ctx);

      // If the custom inspection method returned `this`, don't go into
      // infinite recursion.
      if (ret !== value) {
        if (typeof ret !== 'string') {
          return formatValue(ctx, ret, recurseTimes);
        }
        return ret;
      }
    }
  }

  var keys;
  var symbols = typeof Symbol !== 'undefined' ? Object.getOwnPropertySymbols(value) : [];

  // Look up the keys of the object.
  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  } else {
    keys = Object.keys(value);
    if (symbols.length !== 0)
      symbols = symbols.filter((key) => propertyIsEnumerable.call(value, key));
  }

  var keyLength = keys.length + symbols.length;
  var constructor = getConstructorOf(value);
  var ctorName = constructor && constructor.name ?
    constructor.name + ' ' : '';

  var base = '';
  var formatter = formatObject;
  var braces;
  var noIterator = true;
  var raw;

  // Iterators and the rest are split to reduce checks
  if (value[Symbol.iterator]) {
    noIterator = false;
    if (Array.isArray(value)) {
      // Only set the constructor for non ordinary ("Array [...]") arrays.
      braces = [(ctorName === 'Array ' ? '' : ctorName) + '[', ']'];
      if (value.length === 0 && keyLength === 0)
        return braces[0] + ']';
      formatter = formatArray;
    } else if (isSet(value)) {
      if (value.size === 0 && keyLength === 0)
        return ctorName + '{}';
      braces = [ctorName + '{', '}'];
      formatter = formatSet;
    } else if (isMap(value)) {
      if (value.size === 0 && keyLength === 0)
        return ctorName + '{}';
      braces = [ctorName + '{', '}'];
      formatter = formatMap;
    } else if (isTypedArray(value)) {
      braces = [ctorName + '[', ']'];
      formatter = formatTypedArray;
    } else if (isMapIterator(value)) {
      braces = ['MapIterator {', '}'];
      formatter = formatCollectionIterator;
    } else if (isSetIterator(value)) {
      braces = ['SetIterator {', '}'];
      formatter = formatCollectionIterator;
    } else {
      // Check for boxed strings with valueOf()
      // The .valueOf() call can fail for a multitude of reasons
      try {
        raw = value.valueOf();
      } catch (e) { /* ignore */ }

      if (typeof raw === 'string') {
        var formatted = formatPrimitive(stylizeNoColor, raw);
        if (keyLength === raw.length)
          return ctx.stylize('[String: ' + formatted + ']', 'string');
        base = ' [String: ' + formatted + ']';
        // For boxed Strings, we have to remove the 0-n indexed entries,
        // since they just noisy up the output and are redundant
        // Make boxed primitive Strings look like such
        keys = keys.slice(value.length);
        braces = ['{', '}'];
      } else {
        noIterator = true;
      }
    }
  }
  if (noIterator) {
    braces = ['{', '}'];
    if (ctorName === 'Object ') {
      // Object fast path
      if (keyLength === 0)
        return '{}';
    } else if (typeof value === 'function') {
      var name = constructor.name + (value.name ? ': ' + value.name : '');
      if (keyLength === 0)
        return ctx.stylize('[' + name + ']', 'special');
      base = ' [' + name + ']';
    } else if (isRegExp(value)) {
      // Make RegExps say that they are RegExps
      if (keyLength === 0 || recurseTimes < 0)
        return ctx.stylize(regExpToString.call(value), 'regexp');
      base = ' ' + regExpToString.call(value);
    } else if (isDate(value)) {
      if (keyLength === 0) {
        if (Number.isNaN(value.getTime()))
          return ctx.stylize(value.toString(), 'date');
        return ctx.stylize(dateToISOString.call(value), 'date');
      }
      // Make dates with properties first say the date
      base = ' ' + dateToISOString.call(value);
    } else if (isError(value)) {
      // Make error with message first say the error
      if (keyLength === 0)
        return formatError(value);
      base = ' ' + formatError(value);
    } else if (isAnyArrayBuffer(value)) {
      // Fast path for ArrayBuffer and SharedArrayBuffer.
      // Can't do the same for DataView because it has a non-primitive
      // .buffer property that we need to recurse for.
      if (keyLength === 0)
        return ctorName +
              '{ byteLength: ' + formatNumber(ctx.stylize, value.byteLength) + ' }';
      braces[0] = ctorName + '{';
      keys.unshift('byteLength');
    } else if (isDataView(value)) {
      braces[0] = ctorName + '{';
      // .buffer goes last, it's not a primitive like the others.
      keys.unshift('byteLength', 'byteOffset', 'buffer');
    } else if (isPromise(value)) {
      braces[0] = ctorName + '{';
      formatter = formatPromise;
    } else {
      // Check boxed primitives other than string with valueOf()
      // NOTE: `Date` has to be checked first!
      // The .valueOf() call can fail for a multitude of reasons
      try {
        raw = value.valueOf();
      } catch (e) { /* ignore */ }

      if (typeof raw === 'number') {
        // Make boxed primitive Numbers look like such
        var formatted = formatPrimitive(stylizeNoColor, raw);
        if (keyLength === 0)
          return ctx.stylize(`[Number: ${formatted}]`, 'number');
        base = ` [Number: ${formatted}]`;
      } else if (typeof raw === 'boolean') {
        // Make boxed primitive Booleans look like such
        var formatted = formatPrimitive(stylizeNoColor, raw);
        if (keyLength === 0)
          return ctx.stylize('[Boolean: ' + formatted + ']', 'boolean');
        base = ' [Boolean: ' + formatted + ']';
      } else if (typeof raw === 'symbol') {
        var formatted = formatPrimitive(stylizeNoColor, raw);
        return ctx.stylize('[Symbol: ' + formatted + ']', 'symbol');
      } else if (keyLength === 0) {
        return ctorName + '{}';
      } else {
        braces[0] = ctorName + '{';
      }
    }
  }

  // Using an array here is actually better for the average case than using
  // a Set. `seen` will only check for the depth and will never grow to large.
  if (ctx.seen.indexOf(value) !== -1)
    return ctx.stylize('[Circular]', 'special');

  if (recurseTimes != null) {
    if (recurseTimes < 0)
      return ctx.stylize('[' + (constructor ? constructor.name : 'Object') + ']',
                         'special');
    recurseTimes -= 1;
  }

  ctx.seen.push(value);
  var output = formatter(ctx, value, recurseTimes, keys);

  for (var i = 0; i < symbols.length; i++) {
    output.push(formatProperty(ctx, value, recurseTimes, symbols[i], 0));
  }
  ctx.seen.pop();

  return reduceToSingleString(ctx, output, base, braces, ln);
}



function formatNumber(fn, value) {
  // Format -0 as '-0'. Checking `value === -0` won't distinguish 0 from -0.
  if (value === 0 && (1 / value) === -Infinity)
    return fn('-0', 'number');
  return fn(String(value), 'number');
}

function formatPrimitive(fn, value) {
  if (typeof value === 'string')
    return fn(strEscape(value), 'string');
  if (typeof value === 'number')
    return formatNumber(fn, value);
  if (typeof value === 'boolean')
    return fn(String(value), 'boolean');
  if (typeof value === 'undefined')
    return fn('undefined', 'undefined');
  // es6 symbol primitive
  return fn(value.toString(), 'symbol');
}


function formatError(value) {
  return value.stack || '[' + errorToString.call(value) + ']';
}

function formatObject(ctx, value, recurseTimes, keys) {
  var len = keys.length;
  var output = new Array(len);
  for (var i = 0; i < len; i++)
    output[i] = formatProperty(ctx, value, recurseTimes, keys[i], 0);
  return output;
}

// The array is sparse and/or has extra keys
function formatSpecialArray(ctx, value, recurseTimes, keys, maxLength, valLen) {
  var output = [];
  var keyLen = keys.length;
  var visibleLength = 0;
  var i = 0;
  if (keyLen !== 0 && numberRegExp.test(keys[0])) {
    for (var key of keys) {
      if (visibleLength === maxLength)
        break;
      var index = +key;
      // Arrays can only have up to 2^32 - 1 entries
      if (index > 2 ** 32 - 2)
        break;
      if (i !== index) {
        if (!numberRegExp.test(key))
          break;
        var emptyItems = index - i;
        var ending = emptyItems > 1 ? 's' : '';
        var message = '<' + emptyItems + ' empty item' +  ending + '>';
        output.push(ctx.stylize(message, 'undefined'));
        i = index;
        if (++visibleLength === maxLength)
          break;
      }
      output.push(formatProperty(ctx, value, recurseTimes, key, 1));
      visibleLength++;
      i++;
    }
  }
  if (i < valLen && visibleLength !== maxLength) {
    var len = valLen - i;
    var ending = len > 1 ? 's' : '';
    var message = '<' + len + ' empty item' +  ending + '>';
    output.push(ctx.stylize(message, 'undefined'));
    i = valLen;
    if (keyLen === 0)
      return output;
  }
  var remaining = valLen - i;
  if (remaining > 0) {
    output.push('... ' + remaining + ' more item' + (remaining > 1 ? 's' : ''));
  }
  if (ctx.showHidden && keys[keyLen - 1] === 'length') {
    // No extra keys
    output.push(formatProperty(ctx, value, recurseTimes, 'length', 2));
  } else if (valLen === 0 ||
    keyLen > valLen && keys[valLen - 1] === String(valLen - 1)) {
    // The array is not sparse
    for (i = valLen; i < keyLen; i++)
      output.push(formatProperty(ctx, value, recurseTimes, keys[i], 2));
  } else if (keys[keyLen - 1] !== String(valLen - 1)) {
    var extra = [];
    // Only handle special keys
    var key;
    for (i = keys.length - 1; i >= 0; i--) {
      key = keys[i];
      if (numberRegExp.test(key) && +key < Math.pow(2, 32) - 1)
        break;
      extra.push(formatProperty(ctx, value, recurseTimes, key, 2));
    }
    for (i = extra.length - 1; i >= 0; i--)
      output.push(extra[i]);
  }
  return output;
}

function formatArray(ctx, value, recurseTimes, keys) {
  var len = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
  var hidden = ctx.showHidden ? 1 : 0;
  var valLen = value.length;
  var keyLen = keys.length - hidden;
  if (keyLen !== valLen || keys[keyLen - 1] !== String(valLen - 1))
    return formatSpecialArray(ctx, value, recurseTimes, keys, len, valLen);

  var remaining = valLen - len;
  var output = new Array(len + (remaining > 0 ? 1 : 0) + hidden);
  for (var i = 0; i < len; i++)
    output[i] = formatProperty(ctx, value, recurseTimes, keys[i], 1);
  if (remaining > 0)
    output[i++] = '... ' + remaining + ' more item' + (remaining > 1 ? 's' : '');
  if (ctx.showHidden === true)
    output[i] = formatProperty(ctx, value, recurseTimes, 'length', 2);
  return output;
}

function formatTypedArray(ctx, value, recurseTimes, keys) {
  var maxLength = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
  var remaining = value.length - maxLength;
  var output = new Array(maxLength + (remaining > 0 ? 1 : 0));
  for (var i = 0; i < maxLength; ++i)
    output[i] = formatNumber(ctx.stylize, value[i]);
  if (remaining > 0)
    output[i] = '... ' + remaining + ' more item' + (remaining > 1 ? 's' : '');
  if (ctx.showHidden) {
    // .buffer goes last, it's not a primitive like the others.
    var extraKeys = [
      'BYTES_PER_ELEMENT',
      'length',
      'byteLength',
      'byteOffset',
      'buffer'
    ];
    for (i = 0; i < extraKeys.length; i++) {
      var str = formatValue(ctx, value[extraKeys[i]], recurseTimes);
      output.push('[' + extraKeys[i] + ']: ' + str);
    }
  }
  // TypedArrays cannot have holes. Therefore it is safe to assume that all
  // extra keys are indexed after value.length.
  for (i = value.length; i < keys.length; i++) {
    output.push(formatProperty(ctx, value, recurseTimes, keys[i], 2));
  }
  return output;
}

function formatSet(ctx, value, recurseTimes, keys) {
  var output = new Array(value.size + keys.length + (ctx.showHidden ? 1 : 0));
  var i = 0;
  for (var v of value)
    output[i++] = formatValue(ctx, v, recurseTimes);
  // With `showHidden`, `length` will display as a hidden property for
  // arrays. For consistency's sake, do the same for `size`, even though this
  // property isn't selected by Object.getOwnPropertyNames().
  if (ctx.showHidden)
    output[i++] = '[size]: ' + ctx.stylize(String(value.size), 'number');
  for (var n = 0; n < keys.length; n++) {
    output[i++] = formatProperty(ctx, value, recurseTimes, keys[n], 0);
  }
  return output;
}

function formatMap(ctx, value, recurseTimes, keys) {
  var output = new Array(value.size + keys.length + (ctx.showHidden ? 1 : 0));
  var i = 0;
  for (var [k, v] of value)
    output[i++] = formatValue(ctx, k, recurseTimes) + ' => ' +
      formatValue(ctx, v, recurseTimes);
  // See comment in formatSet
  if (ctx.showHidden)
    output[i++] = '[size]: ' + ctx.stylize(String(value.size), 'number');
  for (var n = 0; n < keys.length; n++) {
    output[i++] = formatProperty(ctx, value, recurseTimes, keys[n], 0);
  }
  return output;
}

function formatPromise(ctx, value, recurseTimes, keys) {
  var output = [];
  for (var n = 0; n < keys.length; n++) {
    output.push(formatProperty(ctx, value, recurseTimes, keys[n], 0));
  }
  return output;
}

function formatProperty(ctx, value, recurseTimes, key, array) {
  var name, str;
  var desc = Object.getOwnPropertyDescriptor(value, key) ||
    { value: value[key], enumerable: true };
  if (desc.value !== undefined) {
    var diff = array === 0 ? 3 : 2;
    ctx.indentationLvl += diff;
    str = formatValue(ctx, desc.value, recurseTimes, array === 0);
    ctx.indentationLvl -= diff;
  } else if (desc.get !== undefined) {
    if (desc.set !== undefined) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else if (desc.set !== undefined) {
    str = ctx.stylize('[Setter]', 'special');
  } else {
    str = ctx.stylize('undefined', 'undefined');
  }
  if (array === 1) {
    return str;
  }
  if (typeof key === 'symbol') {
    name = '[' + ctx.stylize(key.toString(), 'symbol') + ']';
  } else if (desc.enumerable === false) {
    name = '[' + key + ']';
  } else if (keyStrRegExp.test(key)) {
    name = ctx.stylize(key, 'name');
  } else {
    name = ctx.stylize(strEscape(key), 'string');
  }

  return name + ': ' + str;
}


function reduceToSingleString(ctx, output, base, braces, addLn) {
  var breakLength = ctx.breakLength;
  if (output.length * 2 <= breakLength) {
    var length = 0;
    for (var i = 0; i < output.length && length <= breakLength; i++) {
      if (ctx.colors) {
        length += removeColors(output[i]).length + 1;
      } else {
        length += output[i].length + 1;
      }
    }
    if (length <= breakLength)
      return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
  }
  // If the opening "brace" is too large, like in the case of "Set {",
  // we need to force the first item to be on the next line or the
  // items will not line up correctly.
  var indentation = ' '.repeat(ctx.indentationLvl);
  var extraLn = addLn === true ? '\n' +  indentation : '';
  var ln = base === '' && braces[0].length === 1 ?
    ' ' : base + '\n' + indentation + '  ';
  var str = output.join(',\n' + indentation + '  ');
  return extraLn + braces[0] + ln + str + ' ' + braces[1];
}



// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb, null, ret) },
            function(rej) { process.nextTick(callbackifyOnRejected, rej, cb) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;
