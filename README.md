# json-complete

An encoder that can turn any standard JavaScript data object or value into a form that can be serialized by JSON, and do the reverse with a decoder. This includes preserving referential integrity and deduplication of data in the encoded output.

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

json-complete was designed to store, transmit, and reconstruct data created through an immutable data state architecture. Because json-complete stores references, and because the immutable style performs structural sharing, the entire history of an application's business-logic state changes can be compactly encoded and decoded for application debugging purposes. Basically, you can reconstruct anything the user is seeing AND how they got there.

---

## Encode to JSON

The encoder is a pre-process step to make the non-JSON encodable data suitable for encoding as standard JSON. All values, objects, etc are encoded to JSON-legal structure of arrays, numbers, and strings exclusively.

## Referential Integrity

Any Reference Type that points to the same memory location will be encoded as the same pointer string in the data. When decoding, these shared pointer strings will allow shared references to be retained.

## Value Type Deduplication

As Strings and Numbers are encoded to reference strings (Pointers), their values are all stored in the same area, by type. Since values are checked just like references, the same String or Number will never be stored more than once.

## Referencial Deduplication

The same Referencial Type value is only stored once, provided the underlying reference is the same. It is then only referred to by its reference string (Pointer).

## Arbitrarily Deep Nesting

json-complete does not use recursion to do encoding or decoding. As a result, it can support arbitrary deep nesting. The built in JSON `stringify` function appears to utilize recursion, and will throw if the depth of the encoded data grows to deep. This can easily be shown:

```
var outer = [];
var arrayRef = outer;

const depth = 16000;
var d;
for (d = 0; d < depth; d += 1) {
    arrayRef[0] = [];
    arrayRef = arrayRef[0];
}

console.log(outer);
console.log(JSON.stringify(outer)); // Uncaught RangeError: Maximum call stack size exceeded
```

However, `JSON.stringify()` can encode the json-complete encoded output, as it tends to flatten data to a single layer of references.

---

## Comparison to JSON

| json  | json-complete | Supported Types                                      |
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

| json  | json-complete | Features                                             |
|-------|---------------|------------------------------------------------------|
| ❌ *4* | ✅             | Arbitrarily Deep Nesting                             |
| ❌     | ✅             | Circular References                                  |
| ❌     | ✅             | Shared Key and Value Symbol References               |
| ❌     | ✅             | Shared Key and Value Map References                  |
| ❌     | ✅             | Arbitrary Attached Data for All Object-like Types    |
| ❌     | ✅ *5*         | Arbitrary Attached Data for Unsupported Types        |
| ❌     | ✅             | Self-Containment for All Object-like Types           |
| ❌     | ✅ *5*         | Self-Containment for Unsupported Types               |
| ❌     | ✅             | Referencial Integrity for All Reference Types        |
| ❌     | ✅ *5*         | Referencial Integrity for Unsupported Types          |
| ❌     | ✅             | Referencial Deduplication                            |
| ⚠ *6* | ✅             | Root-Level Encoding for All Supported Values         |
| ⚠ *7* | ✅             | Built-in Symbol Keys Not Stored                      |
| ✅     | ❌             | Built into environment                               |
| ✅     | ❌             | Encodes to String                                    |

* *1* - JSON will encode sparse Arrays by injecting null values into the unassigned indices.
* *2* - JSON will encode Arguments Objects as an Object where the indices are converted to String keys, and will not retain other non-integer keys.
* *3* - Blob and File types are only supported natively in Browsers. The asynchronous form of `encode` is required if the value contains a Blob or File type.
* *4* - `JSON.stringify()` appears to operate using recursion and will throw if the depth of encoded objects causes the maximum call stack to be reached. json-complete is non-recursive.
* *5* - Unsupported Types cannot reasonably be encoded. The value of the Type will be encoded as an empty plain Object instead of its real type. Unsupported Types can still encode Arbitrary Attached Data, if it exists.
* *6* - JSON will do root-level encoding only for the types it supports elsewhere.
* *7* - JSON does not encode Built-in Symbol Keys on types because it doesn't encode Symbol Keys at all.

---

## NOT Encoded

Several types of objects are intentionally not encodable or decodable. Even if a particular object is not supported, any attachments to that object that can be encoded and decoded will be. However, the object's value itself will be stored as an empty object.

Objects may be skipped for one of several reasons:

1. It is not data
2. It cannot be fully or correctly encoded/decoded
3. The data inherently tied to a particular execution context and can't be reasonably generalized
4. It is a standard object that is built-in, and has no reason to be stored

For some specific examples:

* Functions - Functions, Named Function Expressions, Getters, Setters, Methods, Async Functions, Generators, and the like, all represent operations, not data. Furthermore, decoding them necessitates some form of an eval function or the use of iframes. Both decode methods can be indirectly blocked by server security headers through no fault of the library user. On top of all that, encoded functions wouldn't be able to handle closure information either, so they would only be useful for pure or global-scope functions anyway.
* WeakSet and WeakMap - By design, these are not iterable for security reasons. Thus, they can't be encoded because json-complete cannot determine what is in them. To allow them to be iterable would potentially allow an attacker to check memory information about the computer it is running on.
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


### Library Size

| Compression | ES Modules | CommonJS |
|-------------|------------|----------|
| None        | 6271 bytes ![](http://progressed.io/bar/6271?scale=6271&suffix=B) | 8313 bytes ![](http://progressed.io/bar/8313?scale=8313&suffix=B) |
| gzip        | 2624 bytes ![](http://progressed.io/bar/2624?scale=6271&suffix=B) | 2825 bytes ![](http://progressed.io/bar/2825?scale=8313&suffix=B) |
| zopfli      | 2578 bytes ![](http://progressed.io/bar/2578?scale=6271&suffix=B) | 2772 bytes ![](http://progressed.io/bar/2772?scale=8313&suffix=B) |
| brotli      | 2376 bytes ![](http://progressed.io/bar/2376?scale=6271&suffix=B) | 2557 bytes ![](http://progressed.io/bar/2557?scale=8313&suffix=B) |


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

* Add top-level error handling to the functions to handle encoding / decoding problems
* Create more meaningful error messages, especially for the decoder.
* Write helper to extract buffer from encoded Blob/File objects on Node
* Write helper to encode buffer into Blob or File objects on Node
* Add a version number part of the encoding process
