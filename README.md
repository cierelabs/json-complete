# json-complete

A library that can turn almost any standard JavaScript data object or value into a JSON-compatible serialized form, and back again. It supports Dates, RegExp, Symbols, Sets, Maps, BigInts, Blobs, and most other built-in JavaScript types! It preserves internal referencial integrity, handles circular references, cannot cause data collisions, and handles arbitrarily deep nesting. json-complete has no dependencies and clocks in at less than 3KB when min-zipped.

---

#### Install for Development

```
npm i
```

#### Run Tests in Node

```
npm run test
```

#### Run Tests in Browser

```
npm run test-browser
```

#### Lint Code

```
npm run lint
```

#### Build Library to `dist` Folder

```
npm run build
```

---

## Purpose

json-complete was designed to store, transmit, and reconstruct data created through an immutable data state architecture. Because json-complete maintains references, and because the immutable style uses structural sharing, the entire history of an application's business-logic state changes can be compactly encoded and decoded for application debugging purposes. Basically, you can reconstruct anything the user is seeing AND how they got there, effectively time-traveling through their actions.

The encoder is largely a pre-process step to make the non-JSON encodable data suitable for encoding as standard JSON. All values, objects, etc are encoded to JSON-legal structure of arrays and strings exclusively, which is then encoded to a standard JSON serialized string.

---

## Features

#### Majority Type Support

| json  | json-complete | Types                                                |
|-------|---------------|------------------------------------------------------|
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
| ❌     | ✅             | Regex                                                |
| ❌     | ✅             | Regex: Retained lastIndex                            |
| ❌     | ✅             | Dates                                                |
| ❌     | ✅             | Dates: Invalid Dates                                 |
| ❌     | ✅             | Symbols                                              |
| ❌     | ✅             | Symbols: Retained Identifiers                        |
| ❌     | ✅             | Symbols: Registered Symbols                          |
| ✅     | ✅             | Objects                                              |
| ❌     | ✅             | Objects: Symbol Keys                                 |
| ✅     | ✅             | Arrays                                               |
| ❌     | ✅             | Arrays: String and Symbol Keys                       |
| ⚠ *1* | ✅             | Arrays: Sparse Arrays                                |
| ⚠ *2* | ✅             | Arguments Object                                     |
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
| ❌     | ✅ *3*         | Blob                                                 |
| ❌     | ✅ *3*         | File                                                 |
| ❌     | ✅             | BigInt                                               |

* *1* - JSON will encode sparse Arrays by injecting null values into the unassigned indices.
* *2* - JSON will encode Arguments Objects as an Object where the indices are converted to String keys, and will not retain other non-integer keys.
* *3* - The asynchronous form of `encode` is required if the value contains a Blob or File type.


#### Internal Referential Integrity

With json-complete, any references that point to the same memory location will be encoded as the same Pointer string in the output. When decoding, these shared Pointer strings will allow shared references to be retained, relative to the entire decoded data.

Note that json-complete will not (and cannot) map decoded data to specific memory locations in an existing JavaScript environment due to the limitations of the language. As a result, just like JSON, encoding and then decoding the data results in an entirely new set of objects, lists, and references. The old references will not change.

Data parsed from a JSON string loses all information about the interal referencial structure of the original data.


#### Circular Reference Handling

Because all references are maintained as Pointers, circular references are not a special case for json-complete.

JSON, on the other hand, will refuse to handle data containing a circular reference.


#### No Data Collision Possible

Other JSON-alternative libraries attempt to handle circular references by attaching special-case keys to objects and arrays that the decoder will then look for, such as including metadata attached to a key prepended with a dollar sign (`$`). However, if the data to be encoded happens to contain the same key, there is a potential for data loss or the circular reference detection to fail.

Since json-complete transforms all data into a referencial form of arrays and strings of a pre-specified form, the referencial information is stored in the relationships of the various arrays encoding that value. No extra information is ever added to the object's data itself, so there is no chance for collisions.


#### Deduplication

Strings, Numbers, and some other Primitive types will be stored no more than once, duplicating the Pointer rather than duplicating the value data in multiple places.

Any time two or more non-value type references point to the same place in memory, the value at that location will only be encoded once, duplicating the Pointer rather than duplicating the value data in multiple places.

JSON will simply duplicate the data multiple times.


#### Arbitrarily Deep Nesting

json-complete does not primarily use recursion to do encoding or decoding. As a result, it can support arbitrarily deep nesting of objects, such as encoding an array containing an array containing an array... and so on, for 50,000 times.

The built in JSON implementation of `stringify` function, however, appears to utilize recursion. It will throw with a `Maximum call stack size exceeded` error if the depth of the encoded data grows to deep.


#### Root Level Encoding of All Supported Types

json-complete allows the top-level encodable item to be any type, not just an Array or Object.

JSON also allows this, though it only supports this for the types it supports.


#### Symbol Key and Value Referencial Integrety

Symbols are unique in that they are a Primitive-like value type, but are addressed by reference by JavaScript. Additionally, they are the only other type of value allowed as an Object key besides String. As a result, it is possible to construct an Object that contains a key and a value that point to the same memory location, that of a single Symbol. json-complete will maintain referencial integrety even in this situation.

JSON does not support Symbols.


#### Built-in Symbols Ignored

There are some built-in Symbols (such as `Symbol.iterator`) provided by type definitions or JavaScript itself that are never encoded, even if Symbol Key Encoding Option (below) is enabled. These are all methods that will be available on the decoded value by virtue of the fact that they will be decode to their pre-encoded type.


#### Option: Safe Mode

If the `safeMode` option is set to a truthy value, the library attempts to do its best to get the most information out of the encoding or decoding process without throwing errors. What can happen in safe mode?

* Encoding
  - If encoding a deferred type like Blob or File, but no `onFinish` option is provided, the output will output all the data it has minus the data from inside the deferred type. Any data attached data on the object may still be saved, and the referencial integrity will be retained.
  - If an unencodable or unrecognized type is part of the data to be encoded, the reference will be encoded as a plain empty object. Any data attached data on the object may still be saved, and the referencial integrity will be retained.
* Decoding
  - If the Pointer type is not recognized, the Pointer string itself will be decoded in its place, rather than attempt to get its value.

Safe Mode will **NOT** prevent throws related to malformed string data when decoding.


#### Option: Symbol Key Encoding

One of the primary purposes of using Symbols as object keys is to provide a way to attach methods without worrying about them being iterated over or modified using standard data reflection techniques. As a result, they are often not intended to be serialized, especially if their value is a function, which cannot be encoded by JSON or json-complete anyway.

By default, json-complete will ignore Symbol keys. By setting, `encodeSymbolKeys` option to a truthy value, the Symbol keys will be encoded.

On the other hand, non-built-in Symbols stored in value positions, not key positions, will not be ignored regardless of the `encodeSymbolKeys` setting.


#### Library Size

| Compression | ES Modules | CommonJS |
|-------------|------------|----------|
| Minified    | 7202 bytes ![](http://progressed.io/bar/100) | 8172 bytes ![](http://progressed.io/bar/100) |
| gzip        | 2883 bytes ![](http://progressed.io/bar/40) | 2900 bytes ![](http://progressed.io/bar/35) |
| zopfli      | 2838 bytes ![](http://progressed.io/bar/39) | 2849 bytes ![](http://progressed.io/bar/35) |
| brotli      | 2648 bytes ![](http://progressed.io/bar/37) | 2652 bytes ![](http://progressed.io/bar/32) |


---


## Limitations

#### Relative JSON Size

In very unscientific testing, for a large, non-circular object, the output length of both the JSON encoded string and the json-complete encoded string were compared. The json-complete string was approximately 25% larger than the JSON string.


#### Unsupported Types

Several types of objects are intentionally not encodable or decodable. Even if a particular object is not supported, any attachments to that object that can be encoded and decoded will be when `safeMode` is enabled. However, the object's value itself will be stored as an empty object.

Objects may be skipped for one of several reasons:

1. It is not data
2. It cannot be fully or correctly encoded/decoded
3. The data is inherently tied to a particular execution context and can't be reasonably generalized
4. It is a standard object that is built-in, and has no reason to be stored

For some specific examples:

* Functions - Functions, Named Function Expressions, Getters, Setters, Methods, Async Functions, Generators, and the like, all represent operations, not data. Furthermore, decoding them necessitates some form of an eval function or the use of iframes. Both ways of decoding functions can be indirectly blocked by server security headers through no fault of the library user. On top of all that, encoded functions wouldn't be able to handle closure information either, so they would only be useful for pure or global-scope functions anyway. Lastly, this would constitute a massive security vulnerability.
* WeakSet and WeakMap - By design, these are not iterable for security reasons. Thus, they can't be encoded because json-complete cannot determine what is inside them. To allow them to be iterable would potentially allow an attacker to check memory information about the computer it is running on.
* Proxies - Proxies are specifically designed to hide information about how they operate, and are mostly functions wrapping primitive data.
* Classes - These are largely syntatic sugar for Functions.
* Various Built-ins
    - window/global
    - document
    - document.location
    - Math
    - JSON
    - Promise
* HTML Element Types - These are usually tied to a specific DOM because they were inserted into the page somewhere. Fully replicating not only their creation, but also their position in the page hierarchy is well beyond the scope of this library, and would be wrong if the data was decoded on a non-identical page anyway.




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
* Reference Types - Any value that is stored in a variable via a pointer, internally. The equality operator checks the reference, not the value.
  - All Object-like Types
  - All Array-like Types
  - Symbol
  - String (sorta - this is how JS operates at the low level, but it is effectively a Value Type as as far as the programmer is concerned)

---

## Data about JS primitive types for storage

### Null
* A value: null

### Undefined
* A value: undefined
  - Create safely with `void 0`

### Boolean
* Can be one of two values:
  - true
  - false

### Object-Wrapped Boolean
* Stores true or false as an Object wrapping a Boolean primitive
* Can store arbitrary data on itself with String or Symbol keys

### String
* Stores text
* All strings are immutable
* Two instances of the same string share a reference to the same global string
* Can hold unicode symbols without special conversions or encodings

### Object-Wrapped String
* Stores text as an Object wrapping a String primitive
* Is represented internally as an array of characters
* Can store arbitrary data on itself with String or Symbol keys

### Number
* A double-precision 64-bit binary format IEEE 754 value.
* Can be decimal or integer, though all values are technically decimal
* Can be positive or negative
* Can represent numbers between `-2^53 - 1` and `2^53 - 1`
* Has special number values:
  - `-0`
  - `Infinity`
  - `-Infinity`
  - `NaN`
* Can also be specified with alternative literals, but these do not affect the value
  - binary (0b_)
  - octal (0_, 000_ and 0o_)
  - hexidecimal (0x_)

### Object-Wrapped Number
* Stores any Number as an Object wrapping a Number primitive
* Can store arbitrary data on itself with String or Symbol keys

### Regex
* Regular pattern specified with slashes and optional flags afterward
* Regex to data => [REGEX.source, REGEX.flags, REGEX.lastIndex]
* Data representation to Regex => new Regex(DATA[0], DATA[1]), then, set the lastIndex value to DATA[2]
* Can store arbitrary data on itself with String or Symbol keys

### Date
* Object containing date/time data
* Date to Number => DATE.getTime()
* Number to Date => new Date(TIME_NUMBER)
* Note: If a Date was constructed with a value that cannot be converted into a date, the result is a Date Object with a value of "Invalid Date".
  - This can be detected by checking for NaN value when calling getTime()
  - Invalid Date objects do not equal each other by default
  - This type of Date object can be encoded with an empty string
* Can store arbitrary data on itself with String or Symbol keys

### Object
* key/value pairs
* key can be a String or Symbol
* value can be anything, including a reference to the parent object

### Symbol
* Globally unique value, usually
* Can be used as an Object key
* Creating Symbol by using Symbol() or Symbol(SOME_STRING) will always be unique, even if the SOME_STRING is used elsewhere
* Creating Symbol by using Symbol.for(SOME_STRING) will create a Registered Symbol with any other Symbol created with the same SOME_STRING using .for()
* Passing a non-string to .for() will convert the value to a string using the String constructor
* If the Symbol is Registered, calling Symbol.keyFor(SOME_SYMBOL) will result in the string key value for that Symbol
* When creating a unique Symbol with a string `Symbol('my string')`, converting the Symbol to a string will retain the string value:
  - `String(Symbol('my string')) // => Symbol(my string)`
  - This includes empty string: `String(Symbol('')) // => Symbol()`
* Symbols cannot accept arbitrary String or Symbol keys like some other Object-like types.
* **Cannot** store arbitrary data on itself with String or Symbol keys

### Array
* A set of indexed values
* Can store anything, including a reference to the array object
* Can be a sparce array, so only store values at used indices
* Optionally, non-integer String and Symbol keys can be attached to the Array, because it is build on Object.
* Specifying integer keys as Strings will overwrite/create refer to the integer position in the Array, not the String key. That is, String keys of integers cannot be used with Arrays.

### Specified TypedArrays
* Types
  - Int8Array
  - Uint8Array
  - Uint8ClampedArray
  - Int16Array
  - Uint16Array
  - Int32Array
  - Uint32Array
  - Float32Array
  - Float64Array
* For the purposes of storage, acts very similarly to standard Arrays
* Limited to storing numerical values in the indexed fields
* Cannot be expanded beyond the defined bounds
* Cannot be sparse -- by default, the unset values are initialized to 0
* Can store other data via String or Symbol keys


### Set
TODO


### Map
TODO


### File
TODO


### Blob
TODO


### ArrayBuffer
TODO



## To Fix and Add

- [x] Write tests for non-safeMode usage
- [x] Write tests for ensuring the correct format of encoded data
- [x] Write tests for extreme depth of Set and Map items
- [x] Add [BigInt](https://github.com/tc39/proposal-bigint) support
- [x] Add option for ignoring Symbol keys during encoding
- [x] Explore encoding numbers as strings
- [x] Reorder the deferment process to pull the blob/file data out first before trying to encode the data, allowing the normal encoding process to work
- [ ] What happens, in safe mode, when decoding an object as a Symbol key?
- [x] Make the encode startup proceedure convert the types into forms useful for the getItemKey function
- [ ] Make tests that forcably remove the Map from availability to cover the fallback lists
- [ ] Write test to make sure that a different blob attached to a blob won't cause missing data
- [ ] Split out and add if checks around Arbitrary Attached Data tests that use symbols
- [ ] Convert the output to string and allow the decoder to accept a string
- [ ] Test Edge, IE 11, and earlier versions
- [ ] Create polyfill for older IE (espcially the use of Map, without creating a false-positive on the existance of Map)
- [ ] Create Promise wrapper so the asynchronous form can be used with Promises or await
- [ ] Update decoding error messages for types not supported in a given environment
- [ ] Write node helpers that will translate to and from Blob/File types using Buffer and object data
