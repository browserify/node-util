# util [![Build Status](https://travis-ci.org/browserify/node-util.png?branch=master)](https://travis-ci.org/browserify/node-util)

> Node.js's [util][util] module for all engines.

This implements the Node.js [`util`][util] module for environments that do not have it, like browsers.

## Install

You usually do not have to install `util` yourself. If your code runs in Node.js, `util` is built in. If your code runs in the browser, bundlers like [browserify](https://github.com/browserify/browserify) or [webpack](https://github.com/webpack/webpack) also include the `util` module.

But if none of those apply, with npm do:

```shell
npm install util
```

## Usage

```javascript
var util = require('util')
var EventEmitter = require('events')

function MyClass() { EventEmitter.call(this) }
util.inherits(MyClass, EventEmitter)
```

## Browser Support

The `util` module uses ES5 features. If you need to support very old browsers like IE8, use a shim like [`es5-shim`](https://www.npmjs.com/package/es5-shim). You need both the shim and the sham versions of `es5-shim`.

To use `util.promisify` and `util.callbackify`, Promises must already be available. If you need to support browsers like IE11 that do not support Promises, use a shim. [es6-promise](https://github.com/stefanpenner/es6-promise) is a popular one but there are many others available on npm.

## API

See the [Node.js util docs][util].  `util` currently supports the Node 8 LTS API. However, some of the methods are outdated. The `inspect` and `format` methods included in this module are a lot more simple and barebones than the ones in Node.js.

The below table lists the parity of each API with the Node.js version. At the time of writing, the most recent Node.js release is 12.1.0. Any entries with that version are considered up to date; the others may be missing features or bugfixes. See the "History" sections for each API in the [Node.js util docs][util] to learn about the changes that were not yet ported to this module.

> A version marked "<1.2.3" means that changes introduced in Node.js 1.2.3 were _not_ yet ported to this module.

| API | Matching Version |
|-|-|
| `callbackify` | 12.1.0 |
| `debuglog` | 0.11.3 |
| `format` | <8.4.0 |
| `formatWithOptions` | missing |
| `getSystemErrorName` | missing |
| `inherits` | 12.1.0 |
| `inspect` | <6.0.0 |
| `isDeepStrictEqual` | missing |
| `promisify` | 12.1.0 |
| `TextDecoder` | missing |
| `TextEncoder` | missing |
| `types` | 12.1.0 |

`util` also contains deprecated Node.js APIs. `_extend` and `log` were deprecated in v6, while the `is*` family of functions was deprecated in v4. All these APIs are up to date:

| Deprecated API | Matching Version |
|-|-|
| `_extend` | 6.0.0 |
| `isArray` | 4.0.0 |
| `isBoolean` | 4.0.0 |
| `isBuffer` | 4.0.0 |
| `isDate` | 4.0.0 |
| `isError` | 4.0.0 |
| `isFunction` | 4.0.0 |
| `isNull` | 4.0.0 |
| `isNullOrUndefined` | 4.0.0 |
| `isNumber` | 4.0.0 |
| `isObject` | 4.0.0 |
| `isPrimitive` | 4.0.0 |
| `isRegExp` | 4.0.0 |
| `isString` | 4.0.0 |
| `isSymbol` | 4.0.0 |
| `isUndefined` | 4.0.0 |
| `log` | 6.0.0 |

## Contributing

PRs are very welcome! The main way to contribute to `util` is by porting features, bugfixes and tests from Node.js. Ideally, code contributions to this module are copy-pasted from Node.js and transpiled to ES5, rather than reimplemented from scratch. Matching the Node.js code as closely as possible makes maintenance simpler when new changes land in Node.js.
This module intends to provide exactly the same API as Node.js, so features that are not available in the core `util` module will not be accepted. Feature requests should instead be directed at [nodejs/node](https://github.com/nodejs/node) and will be added to this module once they are implemented in Node.js.

If there is a difference in behaviour between Node.js's `util` module and this module, please open an issue!

## License

[MIT](./LICENSE)

[util]: https://nodejs.org/docs/latest-v8.x/api/util.html
