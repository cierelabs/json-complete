# json-complete

An encoder that can turn any standard JavaScript object or value into a form that can be serialized by JSON, and do the reverse with a decoder. This includes preserving referential integrity and deduplication of data in the encoded output.

---

## Install

```
npm i
```

---


## Run Tests

```
npm run test
```

---

## Encode to JSON

The encoder is a pre-process step to make the non-JSON encodable data suitable for encoding as standard JSON. All values, objects, etc are encoded to JSON-legal structure of arrays, numbers, and strings exclusively.

## Referential Integrity

Any Reference Type that points to the same memory location will be encoded as the same pointer string in the data. When decoding, these shared pointer strings will allow shared references to be retained.

## Value Type Deduplication

As Strings and Numbers are encoded to reference strings (Pointers), their values are all stored in the same area, by type. Since values are checked just like references, the same String or Number will never be stored more than once.

## Referencial Deduplication

The same Referencial Type value is only stored once, provided the underlying reference is the same. It is then only referred to by its reference string (Pointer).

---

## Comparison to JSON

| json | json-complete | Supported Types                                       |
|------|---------------|-------------------------------------------------------|
| ❌    | ✅             | undefined                                             |
| ✅    | ✅             | null                                                  |
| ✅    | ✅             | Booleans                                              |
| ❌    | ✅             | Booleans: Object-Wrapped                              |
| ✅    | ✅             | Numbers: Normal                                       |
| ❌    | ✅             | Number: NaN                                           |
| ❌    | ✅             | Number: -Infinity                                     |
| ❌    | ✅             | Number: Infinity                                      |
| ❌    | ✅             | Number: -0                                            |
| ❌    | ✅             | Numbers: Object-Wrapped                               |
| ❌    | ✅             | Numbers: Object-Wrapped (NaN, +/-Infinity, -0)        |
| ✅    | ✅             | Strings                                               |
| ❌    | ✅             | Strings: Object-Wrapped                               |
| ❌    | ✅             | Regex                                                 |
| ❌    | ✅             | Regex: Retained lastIndex                             |
| ❌    | ✅             | Dates                                                 |
| ❌    | ✅             | Dates: Invalid Dates                                  |
| ❌    | ✅             | Symbols                                               |
| ❌    | ✅             | Symbols: Retained Identifiers                         |
| ❌    | ✅             | Symbols: Registered Symbols                           |
| ❌    | ✅             | Functions: Expressions                                |
| ❌    | ✅             | Functions: Named Expressions                          |
| ❌    | ✅             | Functions: Arrow Functions                            |
| ❌    | ✅             | Functions: Method Functions                           |
| ❌    | ✅             | Functions: Named Expression Data Referencing          |
| ✅    | ✅             | Objects                                               |
| ❌    | ✅             | Objects: Symbol Keys                                  |
| ✅    | ✅             | Arrays                                                |
| ❌    | ✅             | Arrays: String and Symbol Keys                        |
| ❌ ★  | ✅             | Arrays: Sparse Arrays                                 |
| ❌    | ✅             | Int8Array                                             |
| ❌    | ✅             | Uint8Array                                            |
| ❌    | ✅             | Uint8ClampedArray                                     |
| ❌    | ✅             | Int16Array                                            |
| ❌    | ✅             | Uint16Array                                           |
| ❌    | ✅             | Int32Array                                            |
| ❌    | ✅             | Uint32Array                                           |
| ❌    | ✅             | Float32Array                                          |
| ❌    | ✅             | Float64Array                                          |
| ❌    | ✅             | Set                                                   |
| ❌    | ✅             | Map                                                   |

| json | json-complete | Features                                              |
|------|---------------|-------------------------------------------------------|
| ✅    | ✅             | Arbitrarily Deep Nesting                              |
| ❌    | ✅             | Circular References                                   |
| ❌    | ✅             | Shared Key and Value Symbol References                |
| ❌    | ✅             | Shared Key and Value Map References                   |
| ❌    | ✅             | Arbitrary Attached Data for All Object-like Types     |
| ❌    | ✅ †           | Arbitrary Attached Data for Unsupported Types         |
| ❌    | ✅             | Self-Containment for All Object-like Types            |
| ❌    | ✅ †           | Self-Containment for Unsupported Types                |
| ❌    | ✅             | Referencial Integrity for All Reference Types         |
| ❌    | ✅ †           | Referencial Integrity for Unsupported Types           |
| ❌    | ✅             | Referencial Deduplication                             |
| ✅ ‡  | ✅             | Top-Level Encoding for All Supported Values           |
| ✅    | ❌             | Built-in                                              |

* ★ JSON will encode sparse arrays by injecting null values into the unassigned indices
* † Unsupported Types cannot reasonably be encoded. The value of the Type will be encoded as an empty plain Object instead of its real type. Unsupported Types can still encode Arbitrary Attached Data, if it exists.
  - WeakSet and WeakMap - Not iterable, by design, for security reasons.
  - Math
  - window/global
  - document
  - HTML Element Types
  - document.location
  - JSON
  - etc.
* ‡ JSON will do top-level encoding only for the types it supports elsewhere

### Terms

* Object-like Types - Can contain key/value pairs using a String or Symbol key.
  - Booleans: Object-Wrapped
  - Numbers: Object-Wrapped
  - Strings: Object-Wrapped
  - Regex
  - Dates
  - Functions
  - Objects
* Array-like Types - Can contain integer key/value pairs, as well as containing key/value pairs using a String or Symbol key (same as Object-like Types).
  - Arrays
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
  - Symbols
  - Strings (sorta - this is how JS operates at the low level, but it is effectively a Value Type as as far as the programmer is concerned)

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

### Function
* Can save various Function Expressions, but **cannot store Closure or Global state information**, as the Function is converted to a String.
* Has many forms:
  - Function Expression: `function(...) { ... }`
  - Named Function Expression: `function myFunction(...) { ... }`
  - Arrow Function: `(...) => { ... }`
  - Bare Arrow Function: `x => x`
  - Method Function: `{ x(...) { ... } }`
    - Can only exist in an Object context
    - Operationally, it is identical to a Function Expression (NOT a Named Function Expression) where the Function name is the key String in the Object, however it serializes to String differently.
* Can store arbitrary data on itself with string or Symbol keys
* TODO: Look into async, getter/setter, and other newer types

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
Due to limitations in both maximum string length and the efficiency of Base64 encoding, Blobs larger than about 100MB cannot be stored in json-complete. Furthermore, the maximum size of the entire json-complete structure can only be about 130MB when encoding it to a string, so splitting a gigabyte blob into multiple chucks will not work either.

TODO


### ArrayBuffer
TODO



### WeakMap
TODO


### WeakSet
TODO


## To Fix and Add

* There are additional function forms like async functions, getters, and setters to consider.
* Since functions can be encoded, the decoder for a given set of data can be included.
* Add top-level error handling to the functions to handle encoding / decoding problems
* Create more meaningful error messages, especially for the decoder.
* Because ArrayBuffer types are always filled, never sparse, simplify the encoding by removing the explicit index encoding
