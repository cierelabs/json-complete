# json-complete

json-complete can turn almost any standard JavaScript data object or value into a JSON-compatible serialized form, and back again. It supports Dates, RegExp, Symbols, Sets, Maps, BigInts, Blobs, and most other built-in JavaScript types! It preserves internal referential integrity, handles circular references, handles arbitrarily deep nesting, and it cannot cause data collisions. json-complete has no dependencies and is less than 3.5KB when min-zipped. json-complete is distributed with both ES Module and CommonJS support.



## Purpose

json-complete was designed to store, transmit, and reconstruct data created through an immutable data state architecture. Because json-complete maintains references after encoding, and because the immutable style uses structural sharing, the entire history of an application's business-logic state changes can be compactly encoded and decoded for application debugging purposes. Basically, you can reconstruct anything the user is seeing AND how they got there, effectively time-traveling through their actions.



## Installation

```bash
npm i --save json-complete
```



## API

```javascript
jsonComplete.encode(value, [options={}]);
```

* `value` - (any type) Some value to encode.
* `options` - (Object) Optional. Option definitions:
  - `options.compat` - (truthy or falsy) Optional. Makes the encoder more forgiving of unknown or incompatible Types, at the cost of lost information. See **Option: Compat Mode** below.
  - `options.encodeSymbolKeys` - (truthy or falsy) Optional. Turns on the encoder's ability to encode Symbol keys on Types. See **Option: Symbol Key Encoding** below.
  - `options.onFinish` - (Function) Optional, except when using a Deferred Type. If specified, the encoder will call the provided function with the encoded String as an argument, rather than returning it from the `encode` function. This option can be useful for creating a Promise-based wrapper. This option is **required** if the `value` contains a Deferred Type, since Deferred Types cannot be synchronously encoded.
* *return value* - (String) - The encoded String form of `value`. If `options.onFinish` is specified, the return value is `undefined`.

```javascript
jsonComplete.decode(encodedString, [options={}]);
```

* `encodedString` - (String) The encoded String form of a value created by calling `jsonComplete.encode()`.
* `options` - (Object) Optional. Option definitions:
  - `options.compat` - (truthy or falsy) Optional. Makes the decoder more forgiving of malformed data, incompatible Types, and environmental limitations, at the cost of lost information. See **Option: Compat Mode** below.
* *return value* - (any type) - The reconstructed value.



## Usage

#### Example: Normal Usage

```javascript
var jsonComplete = require('json-complete');
// or `import jsonComplete from 'json-complete';` with appropriate build system

var big = BigInt(Number.MAX_SAFE_INTEGER);
var input = {
    a: 1,
    b: big * big,
    circular: void 0,
    nan: NaN,
    set: new Set([1, 2, 3]),
};
input.circular = input;

var encoded = jsonComplete.encode(input);
console.log(encoded);
// ["O0","2.0.0",["O","S0S1S2S3S4 N0_0O0C0U0"],["S",["a","b","circular","nan","set"]],["N","1,2,3"],["_","81129638414606663681390495662081"],["U","N0N1N2"]]

console.log(jsonComplete.decode(encoded));
// Exact same structure and value as input
```


#### Example: Root Level Type Encoding

```javascript
var jsonComplete = require('json-complete');
// or `import jsonComplete from 'json-complete';` with appropriate build system

var input = false;

var encoded = jsonComplete.encode(input);
console.log(encoded);
// ["F","2.0.0"]

console.log(jsonComplete.decode(encoded));
// false
```


#### Example: Symbol Key Encoding

```javascript
var jsonComplete = require('json-complete');
// or `import jsonComplete from 'json-complete';` with appropriate build system

var input = {
    a: 1,
};
input[Symbol()] = 2;

var encodedWithSymbolKeys = jsonComplete.encode(input, {
    encodeSymbolKeys: true,
});
console.log(encodedWithSymbolKeys);
// ["O0","2.0.0",["O","S0P0 N0N1"],["S",["a"]],["P",["s"]],["N","1,2"]]

var decodeWithSymbolKeys = jsonComplete.decode(encodedWithSymbolKeys);
console.log(decodeWithSymbolKeys);
// {a: 1, Symbol(): 2}

var encoded = jsonComplete.encode(input);
console.log(encoded);
// ["O0","2.0.0",["O","S0 N0"],["S",["a"]],["N","1"]]

console.log(jsonComplete.decode(encoded));
// {a: 1}
```


#### Example: Compat Mode Option

```javascript
var jsonComplete = require('json-complete');
// or `import jsonComplete from 'json-complete';` with appropriate build system

var badIdea = Math;
badIdea.a = false;

var encoded = jsonComplete.encode(badIdea, {
    compat: true,
});
console.log(encoded);
// ["O0","2.0.0",["O","S0 F0"],["S",["a"]]]
// Because compat mode was used, the Math object is encoded as an empty object

console.log(jsonComplete.decode(encoded));
// { a: false }
```


#### Example: Deferred Type and onFinish Option

```javascript
var jsonComplete = require('json-complete');
// or `import jsonComplete from 'json-complete';` with appropriate build system

var input = [new Blob(['data'], { type: 'application/json' }), 1];

var encoded = jsonComplete.encode(input, {
    onFinish: function(encoded) {
        console.log(encoded);
        // ["A0","2.0.0",["A","Y0N0"],["Y","$0S0"],["N","1,100,97,116"],["S",["application/json"]],["$","N1N2N3N2"]]

        console.log(jsonComplete.decode(encoded));
        // [(BLOB: content is "data", type is "application/json"), 1]
    },
});
```


#### Example: Deferred Type and onFinish Option Not Provided

```javascript
var jsonComplete = require('json-complete');
// or `import jsonComplete from 'json-complete';` with appropriate build system

var input = [new Blob(['data'], { type: 'application/json' }), 1];

var encoded = jsonComplete.encode(input, {
    compat: true,
});
console.log(encoded);
// ["A0","2.0.0",["A","Y0N0"],["Y","K0S0"],["N","1"],["S",["application/json"]]]
// [(BLOB: content is empty, type is "application/json"), 1]
```



## Features

#### Majority Type Support

| json  | json-complete | Types                                                |
|:-----:|:-------------:|------------------------------------------------------|
| ❌     | ✅             | undefined                                            |
| ✅     | ✅             | null                                                 |
| ✅     | ✅             | Booleans                                             |
| ❌     | ✅             | Booleans: Object-Wrapped                             |
| ✅     | ✅             | Numbers: Normal                                      |
| ❌     | ✅             | Number: NaN                                          |
| ❌     | ✅             | Number: -Infinity                                    |
| ❌     | ✅             | Number: Infinity                                     |
| ❌     | ✅             | Number: -0                                           |
| ❌     | ✅             | Numbers: Object-Wrapped                              |
| ❌     | ✅             | Numbers: Object-Wrapped (NaN, +/-Infinity, -0)       |
| ✅     | ✅             | Strings                                              |
| ❌     | ✅             | Strings: Object-Wrapped                              |
| ❌     | ✅             | Dates                                                |
| ❌     | ✅             | Dates: Invalid Dates                                 |
| ❌     | ✅             | Error (built-in Error objects)                       |
| ❌     | ✅             | Regex                                                |
| ❌     | ✅             | Regex: Retained lastIndex                            |
| ❌     | ✅             | Symbols                                              |
| ❌     | ✅             | Symbols: Retained Identifiers                        |
| ❌     | ✅             | Symbols: Registered Symbols                          |
| ✅     | ✅             | Objects                                              |
| ❌     | ✅             | Objects: Symbol Keys                                 |
| ✅     | ✅             | Arrays                                               |
| ❌     | ✅             | Arrays: String and Symbol Keys                       |
| ⚠ `1` | ✅             | Arrays: Sparse Arrays                                |
| ⚠ `2` | ✅             | Arguments Object                                     |
| ❌     | ✅             | ArrayBuffer                                          |
| ❌     | ✅             | SharedArrayBuffer                                    |
| ❌     | ✅             | Int8Array                                            |
| ❌     | ✅             | Uint8Array                                           |
| ❌     | ✅             | Uint8ClampedArray                                    |
| ❌     | ✅             | Int16Array                                           |
| ❌     | ✅             | Uint16Array                                          |
| ❌     | ✅             | Int32Array                                           |
| ❌     | ✅             | Uint32Array                                          |
| ❌     | ✅             | Float32Array                                         |
| ❌     | ✅             | Float64Array                                         |
| ❌     | ✅             | Set                                                  |
| ❌     | ✅             | Map                                                  |
| ❌     | ✅ `3`         | Blob                                                 |
| ❌     | ✅ `3`         | File                                                 |
| ❌     | ✅             | BigInt                                               |
| ❌     | ✅             | BigInt64Array                                        |
| ❌     | ✅             | BigUint64Array                                       |

* `1` - JSON will encode sparse Arrays by injecting null values into the unassigned indices.
* `2` - JSON will encode Arguments Objects as an Object where the indices are converted to String keys, and will not retain other non-integer keys.
* `3` - The asynchronous form of `encode` is required if the value contains a Blob or File type.


#### Internal Referential Integrity

With json-complete, any references that point to the same memory location will be encoded as the same Pointer string in the output. When decoding, these shared Pointer strings will allow shared references to be retained, relative to the entire decoded data.

Note that json-complete will not (and cannot) map decoded data to specific memory locations in an existing JavaScript environment due to the limitations of the language. As a result, just like JSON, encoding and then decoding the data results in an entirely new set of objects, lists, and references. The old references will not change.

Conversely, data parsed from a JSON string loses all information about the interal referential structure of the original data.


#### Circular Reference Handling

Because all references are maintained as Pointers, circular references are not a special case for json-complete.

JSON, on the other hand, will refuse to handle data containing a circular reference.


#### No Data Collision Possible

Other JSON-alternative libraries attempt to handle circular references by attaching special-case keys to objects and arrays that the decoder will then look for, such as including metadata attached to a key prepended with a dollar sign (`$`). However, if the data to be encoded happens to contain the same key, there is a potential for data loss or the circular reference detection to fail.

Since json-complete transforms all data into a referential form of arrays and strings of a pre-specified form, the referential information is stored in the relationships of the various arrays encoding that value. No extra information is ever added to the object's data itself, so there is no chance for collisions.


#### Deduplication

Primitive Types (Strings, Numbers, BigInt) with the same value will be stored no more than once, duplicating the Pointer rather than duplicating the value data in multiple places.

Any time two or more references point to the same place in memory, the value at that location will only be encoded once, duplicating the Pointer rather than duplicating the value data in multiple places.

Symbols are an exception, since they are both a Primitive and Referential Type. Though an individual Symbol reference will not be stored more than once, other Symbols with the same signature will not be deduplicated.

In contrast, JSON will simply duplicate the data multiple times.


#### Arbitrarily Deep Nesting

json-complete does not primarily use recursion to do encoding or decoding. As a result, it can support arbitrarily deep nesting of objects, such as encoding an array containing an array containing an array... and so on, for 50,000 times or more.

The built in JSON implementation of `stringify` function, however, appears to utilize recursion. It will throw with a `Maximum call stack size exceeded` error if the depth of the encoded data grows too deep (nested arrays around 8,000 levels deep in Google Chrome).


#### Root Level Encoding of All Supported Types

json-complete allows the top-level encodable item to be any type, not just an Array or Object.

JSON also allows this, though it only supports this feature for the types JSON natively supports.


#### Symbol Key and Value Referential Integrity

Symbols are unique in that they are a Primitive-like value type, but are addressed by reference by JavaScript. Additionally, they are the only other type of value allowed as an Object key besides String. As a result, it is possible to construct an Object that contains a key and a value that point to the same memory location, that of a single Symbol. json-complete will maintain referential integrity even in this situation.

```javascript
var sym = Symbol();
var obj = {};
obj[sym] = sym;
// ...encode then decode
var decodedObjectKeySymbol = Object.getOwnPropertySymbols(decoded)[0];
console.log(decodedObjectKeySymbol === decoded[decodedObjectKeySymbol]); // true
```

JSON does not support Symbols.


#### Built-in Symbols Ignored

There are some built-in Symbols (such as `Symbol.iterator`) provided by type definitions or JavaScript itself that are never encoded, even if Symbol Key Encoding Option (below) is enabled. When decoding, the JS runtime will add these built-in Symbols during the type's construction.


#### Option: Compat Mode

If the `compat` option is set to a truthy value, the library attempts to do its best to get the most information out of the encoding or decoding process without throwing errors. What can happen in compat mode?

* Encoding
  - If encoding a Deferred Type like Blob or File, but no `onFinish` option is provided, the encoder will output all the data it has minus the data from inside the Deferred Type. Any attached data on the object may still be saved, and the referential integrity will be retained.
  - If an unencodable or unrecognized type is part of the data to be encoded, the reference will be encoded as a plain empty object. Any attached data on the object may still be saved, and the referential integrity will be retained.
* Decoding
  - If the Pointer type is not recognized, the Pointer string itself will be decoded in its place, rather than attempt to get its value.
  - If a given Type cannot be constructed due to malformed encoded data or the environment does not support a given Type, the Type will be ignored and skipped over, remaining undefined.
  - If the environment does not support Symbols, but the encoded data defines a Symbol key, that particular key-value pair will be skipped.
  - If the environment does not support the Sticky or Unicode flags in RegExp objects, but the encoded data defines such a flag, the RegExp object will be created without either of those flags.
  - If attempting to decode a File object in an environment that supports Files but doesn't support the File Constructor (IE10, IE11, and Edge), the File will be decoded as a Blob type, with the `name` and `lastModified` values simply attached as properties.

Compat Mode will **NOT** prevent throws related to significantly malformed encoded data when decoding.


#### Option: Symbol Key Encoding

One of the primary purposes of using Symbols as object keys is to provide a way to attach methods without worrying about them being iterated over or modified using standard data reflection techniques. As a result, they are often not intended to be serialized, especially if their value is a function, which cannot be encoded by JSON or json-complete anyway.

By default, json-complete will ignore Symbol keys. By setting the `encodeSymbolKeys` option to a truthy value, the Symbol keys will be encoded.

On the other hand, Symbols stored in value positions, not key positions, will not be ignored regardless of the `encodeSymbolKeys` setting.



## Library Size

| Compression | ES Module  | CommonJS |
|-------------|------------|----------|
| Minified    | 8810 bytes | 9959 bytes |
| gzip        | 3469 bytes | 3469 bytes |
| zopfli      | 3394 bytes | 3398 bytes |
| brotli      | 3135 bytes | 3135 bytes |


## Tests

There are currently over 730 tests, with some tests and branches only applying to some platforms. All code paths should be covered by at least one test.

Only Google Chrome is currently able to run all of the primary tests due to differences in Type support across various browser and Node platforms.

The library and all its supportable tests have been tested on:

* Google Chrome (70)
* Firefox (65)
* Safari (12)
* Edge (17)
* Internet Explorer 11
* Internet Explorer 10
* Internet Explorer 9
* Node (11.4.0)



## Limitations

#### Relative JSON Size

In very unscientific testing, for a large, non-circular object [generated here](https://www.json-generator.com/), the output length of both the JSON encoded string and the json-complete encoded string were compared. The json-complete string was actually 18% smaller than the JSON string. The reduction almost certainly has to do with string and number deduplication. Indeed, when compressing them, the gzipped json-complete output became 8% larger than the gzipped json output. Thus, roughly speaking, the absolute cost of storing referencial data in addition to the information content is about 8%.

For a much smaller object, with less duplication of data, the resulting comparion saw the json-complete encoded file being about 15% larger than the equivalent JSON string. When gzipped, the difference remained about the same.

In conclusion, the relative size of a json-complete string, with all it's additional data and support, is roughly equivalent to a JSON string with the same data. Some types of data will be more or less efficient, mileage will vary. However, expect to have an overhead of about 8% if gzipping json-complete data versus JSON data.


#### Unsupported Types

Several Types are intentionally not encodable or decodable. Even if a particular Type is not supported, attachments to such a Type instance can be encoded and decoded when `compat` is enabled. However, the Type instance's value itself will be stored as an empty Object to maintain referential integrity.

Types may be skipped for one of several reasons:

1. It is not data.
2. It cannot be fully or correctly encoded/decoded.
3. The data is inherently tied to a particular execution context and can't be reasonably generalized.
4. It is a standard object that is built-in, and has no reason to be stored.

For some specific examples:

* Functions - Functions, Named Function Expressions, Getters, Setters, Methods, Async Functions, Generators, and the like, all represent behavior, not data. Furthermore, decoding them necessitates some form of an `eval` function or the use of iframes. Both ways of decoding functions can be indirectly blocked by server security headers through no fault of the library user. On top of all that, encoded functions wouldn't be able to handle closure information either, so they would only be useful for pure or global-scope functions anyway. Lastly, this would constitute a massive security vulnerability.
* WeakSet and WeakMap - By design, these are not iterable for security reasons. Thus, they can not be encoded because json-complete cannot determine what is inside them. To allow them to be iterable would potentially allow an attacker to check memory information about the computer it is running on.
* Proxies - Proxies are specifically designed to hide information about how they operate, and are mostly functions wrapping primitive data.
* Classes - These are largely syntatic sugar for functions.
* Various Built-ins
    - window/global
    - document
    - document.location
    - Math
    - JSON
    - Promise
* HTML Element Types - These are usually tied to a specific DOM because they were inserted into the page somewhere. Fully replicating not only their creation, but also their position in the page hierarchy is well beyond the scope of this library, and would be wrong if the data was decoded on a non-identical page anyway.


#### Storing Built-In Symbols as Values

In an extremely rare edge case, which should be avoided, built-in Symbols can be stored as values on other Objects, since the Symbol is a Reference Type like most other types. When encoding these values, the Symbol is converted to the String form, which removes the reference to the original built-in Symbol. When decoding them, the Symbol will be unique, but it won't be the same kind of Symbol.



## Platform Support

The table below illustrates the primary feature support differences on various platforms. Below that, more detailed explainations of specific limitations, beyond simply not supporting a type, are explained.

| Chrome (70) | Node (11.4) | Firefox (65) | Safari (12) | Edge (17) | IE11  | IE10 | IE9 |                                                |
|:-----------:|:-----------:|:------------:|:-----------:|:---------:|:-----:|:----:|:---:|------------------------------------------------|
| 734         | 678         | 665          | 665         | 640       | 517   | 434  | 271 | Tests Runnable                                 |
| ✅           | ✅           | ✅            | ✅           | ❌         | ❌     | ❌    | ❌   | Faster Reference Encoder                       |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | undefined                                      |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | null                                           |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Booleans                                       |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Booleans: Object-Wrapped                       |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Numbers: Normal                                |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Number: NaN                                    |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Number: -Infinity                              |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Number: Infinity                               |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Number: -0                                     |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Numbers: Object-Wrapped                        |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Strings                                        |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Strings: Object-Wrapped                        |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Dates                                          |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Dates: Invalid Dates                           |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Error                                          |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Regex                                          |
| ✅           | ✅           | ✅            | ✅           | ✅         | ❌     | ❌    | ❌   | Regex Sticky Flag                              |
| ✅           | ✅           | ✅            | ✅           | ✅         | ❌     | ❌    | ❌   | Regex Unicode Flag                             |
| ✅           | ✅           | ✅            | ✅           | ✅         | ❌     | ❌    | ❌   | Symbol                                         |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Objects                                        |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Arrays                                         |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ✅   | Arguments Object                               |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ❌   | ArrayBuffer                                    |
| ✅           | ✅           | ❌            | ❌           | ❌         | ❌     | ❌    | ❌   | SharedArrayBuffer                              |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ❌   | Int8Array                                      |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ❌   | Uint8Array                                     |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ❌    | ❌   | Uint8ClampedArray                              |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ❌   | Int16Array                                     |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ❌   | Uint16Array                                    |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ❌   | Int32Array                                     |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ❌   | Uint32Array                                    |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ❌   | Float32Array                                   |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ✅    | ❌   | Float64Array                                   |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ❌    | ❌   | Set                                            |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ❌    | ❌   | Map                                            |
| ✅           | ✅           | ✅            | ✅           | ✅         | ❌     | ❌    | ❌   | WeakSet Tests                                  |
| ✅           | ✅           | ✅            | ✅           | ✅         | ✅     | ❌    | ❌   | WeakMap Tests                                  |
| ✅           | ❌           | ✅            | ✅           | ✅         | ✅     | ✅    | ❌   | Blob                                           |
| ✅           | ❌           | ✅            | ✅           | ⚠ `1`     | ⚠ `1` | ⚠ `1` | ❌   | File                                          |
| ✅           | ✅           | ❌            | ❌           | ❌         | ❌     | ❌    | ❌   | BigInt                                         |
| ✅           | ✅           | ❌            | ❌           | ❌         | ❌     | ❌    | ❌   | BigInt64Array                                  |
| ✅           | ✅           | ❌            | ❌           | ❌         | ❌     | ❌    | ❌   | BigUint64Array                                 |

* `1` - Cannot construct a native File type. In compat mode, encoded File objects will be decoded as duck-typed Blobs.


#### Node (11.4.0) Limitations

* **No Blob or File Support** - Node supports `Buffer` instead. In the future, the ability to encode or decode between these types will be provided through extra utility functions.


#### Microsoft Edge (17) Limitations

* **Slower Reference Encoder** - Some versions of Microsoft Edge prior to version 18 can support Symbols and Map. However, they have a race condition of some sort that can sometimes allow Symbols used as Object keys to be duplicated in an ES2015 Map collection. A special test is performed to detect this, and if such an issue is detected, the library will fall back to a list-based implementation, rather than using native ES2015 Map.
* **Limited File Decoding** - Microsoft Edge supports File types, but does not support the File constructor. If attempting to decode an encoded File object, json-complete will throw. However, in compat mode, the data will be decoded as a Blob type with `lastModified` and `name` properties added as normal properties.


#### Internet Explorer 11 Limitations

* **Slower Reference Encoder** - Even though IE11 supports a Map type, it differs slightly from other implementations. To be safe, it is not used internally. As a result, the performance of the encoder can be significantly worse than in other browsers.
* **Limited File Decoding** - Internet Explorer 11 supports File types, but does not support the File constructor. If attempting to decode an encoded File object, json-complete will throw. However, in compat mode, the data will be decoded as a Blob type with `lastModified` and `name` properties added as normal properties.
* **Distinct Negative Zero Keyed Collections** - The keys in Maps and the values in Set can support negative zero (-0) as a distinct value separate from 0. This is allowed, but users should be aware of this in case they are also storing a zero value, and then expecting to have two different results when decoding on a more modern browser.
* **No Sticky and Unicode Regex Flags** - The sticky and unicode flags on RegExp objects are not supported. If attempting to decode a RegExp object with one or both of these flags, an error will be thrown. In compat mode, the decoder will instead generate a RegExp object without those flags.


#### Internet Explorer 10 Limitations

* **Slower Reference Encoder** - IE10 does not support Map, so it falls back to a slower, list-based implementation.
* **Limited File Decoding** - Internet Explorer 10 supports File types, but does not support the File constructor. If attempting to decode an encoded File object, json-complete will throw. However, in compat mode, the data will be decoded as a Blob type with `lastModified` and `name` properties added as normal properties.
* **No Sticky and Unicode Regex Flags** - The sticky and unicode flags on RegExp objects are not supported. If attempting to decode a RegExp object with one or both of these flags, an error will be thrown. In compat mode, the decoder will instead generate a RegExp object without those flags.


#### Internet Explorer 9 Limitations

* **Slower Reference Encoder** - IE10 does not support Map, so it falls back to a slower, list-based implementation.
* **No Sticky and Unicode Regex Flags** - The sticky and unicode flags on RegExp objects are not supported. If attempting to decode a RegExp object with one or both of these flags, an error will be thrown. In compat mode, the decoder will instead generate a RegExp object without those flags.


#### Internet Explorer 8 Limitations

Not yet supported.


#### Internet Explorer 7 Limitations

Not yet supported.


#### Internet Explorer 6 Limitations

Not yet supported.


---


### Terms

* Object-like Types - Can contain key/value pairs using a String or Symbol key.
  - Boolean: Object-Wrapped
  - Number: Object-Wrapped
  - String: Object-Wrapped
  - Regex
  - Date
  - Error
  - Object
  - ArrayBuffer
  - SharedArrayBuffer
  - Set
  - Map
  - Blob
  - File
* Array-like Types - Can contain integer key/value pairs, as well as containing key/value pairs using a String or Symbol key (same as Object-like Types).
  - Array
  - Arguments
  - Int8Array
  - Uint8Array
  - Uint8ClampedArray
  - Int16Array
  - Uint16Array
  - Int32Array
  - Uint32Array
  - Float32Array
  - Float64Array
  - BigInt64Array
  - BigUint64Array
* Reference Types - Any value that is stored in a variable via a pointer, internally. The equality operator checks the reference, not the value.
  - All Object-like Types
  - All Array-like Types
  - Symbol
* Deferred Types - Any value that cannot be read synchronously, and requires the use of a callback or Promise.
  - Blob
  - File
* Primitive Types - Base level types that operate as immutable value types
  - Boolean
  - Number
  - String
  - BigInt
  - Undefined
  - Null


---

## To Fix and Add

- [x] Write tests for non-compat mode usage
- [x] Write tests for ensuring the correct format of encoded data
- [x] Write tests for extreme depth of Set and Map items
- [x] Add [BigInt](https://github.com/tc39/proposal-bigint) support
- [x] Add option for ignoring Symbol keys during encoding
- [x] Explore encoding numbers as strings
- [x] Reorder the deferment process to pull the blob/file data out first before trying to encode the data, allowing the normal encoding process to work
- [x] Make the encode startup proceedure convert the types into forms useful for the getItemKey function
- [x] Make tests that forcably remove the Map from availability to cover the fallback lists
- [x] Add fallback blob support for files when decoding in compat mode
- [x] Finish features for Edge
- [x] Write test to make sure that a different blob attached to a blob won't cause missing data
- [x] Fix the bug related to storing Blob inside a Keyed Collection (DeferredTypeInsideKeyedCollection.js)
- [x] Change "Safe Mode" to "Compat Mode"
- [x] Investigate possible bug related to duplicate primitives (numbers, strings) not being deduplicated in output (upon further observation, it is not a problem)
- [x] Simplify the encoding process from the perspective of the definer by removing the in-line encounterItem steps, pushing those into the encoder
- [x] Finish rework of type interface API
- [x] Pull out duplicate code
- [x] What happens, in compat mode, when decoding an a Symbol key in an environment that doesn't support Symbols? (Ignores entries with Symbol keys)
- [x] Put examples in readme
- [x] Convert the output to string and allow the decoder to accept a string
- [x] Update decoding error messages for types not supported in a given environment
- [x] Release 1.0.0 publicly
- [x] Add support for BigInt64Array and BigUint64Array.
- [x] Split out and add if checks around Arbitrary Attached Data tests that use symbols.
- [x] Explore String compressed form for internal arrays.
- [x] Support IE11
- [x] Support IE10
- [x] Support IE9
- [x] Write script that will convert between different data versions.


## Future Plans
- [ ] Write node helpers that will translate to and from Blob/File types using Buffer and object data.
- [ ] Update library export structure to allow more flexibility to only import the encoder or decoder portions.
- [ ] Allow Simple, Wrapped Primitive, and Keyed Collection types to define their own identification with a hook that will be called in getItemKey.
- [ ] Explore simple numerical compression for Number and BigInt types (Base91 encoding for '0-9', '.', 'e', '-', '+')
- [ ] Legacy version that has no support for Symbol, Keyed Collection Types, Typed Array types, ArrayBuffer, SharedArrayBuffer, Blob, File, or BigInt types and provides its own limited JSON.stringify and JSON.parse just for strings and arrays.
- [ ] Support IE8 with legacy version
- [ ] Support IE7 with legacy version
- [ ] Support IE6 with legacy version
- [ ] Create Promise wrapper so the asynchronous form can be used with Promises or await.
- [ ] Move tests to [BrowserStack](https://www.browserstack.com/) to provide more coverage of available environments.
