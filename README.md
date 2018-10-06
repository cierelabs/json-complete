# json-complete

An encoder that can turn any standard JavaScript object or value into a form that can be serialized by JSON, and do the reverse with a decoder. This includes preserving referential integrity and deduplication of data in the encoded output.

## Referential Integrity

Any reference type that points to the same memory location will be encoded as the same pointer string in the data. When decoding, these shared pointer strings will allow shared references to be retained.

## Deduplication

Since values are being converted to references first, all value of a given type are encoded together, and are therefore deduplicated. No matter how many times a unique value is used, it will only be stored once. This includes strings and numbers.

## Encode to JSON

The encoder is a pre-process step to make the non-JSON encodable data suitable for encoding as standard JSON. All values, objects, etc are encoded to JSON-legal numbers, strings, and arrays exclusively.

## Comparison to JSON

| json | json-complete | Feature                                               |
|------|---------------|-------------------------------------------------------|
| ❌    | ✅             | undefined                                             |
| ✅    | ✅             | null                                                  |
| ✅    | ✅             | Booleans                                              |
| ❌    | ✅             | Object-Wrapped Booleans                               |
| ❌    | ✅             | Object-Wrapped Boolean Arbitrary Attached Data        |
| ❌    | ✅             | Object-Wrapped Boolean Self-Containment               |
| ✅    | ✅             | Normal Numbers                                        |
| ❌    | ✅             | Number: NaN                                           |
| ❌    | ✅             | Number: -Infinity                                     |
| ❌    | ✅             | Number: Infinity                                      |
| ❌    | ✅             | Number: -0                                            |
| ❌    | ✅             | Object-Wrapped Numbers                                |
| ❌    | ✅             | Object-Wrapped Number Arbitrary Attached Data         |
| ❌    | ✅             | Object-Wrapped Number Self-Containment                |
| ✅    | ✅             | Strings                                               |
| ❌    | ✅             | Object-Wrapped Strings                                |
| ❌    | ✅             | Object-Wrapped String Arbitrary Attached Data         |
| ❌    | ✅             | Object-Wrapped String Self-Containment                |
| ❌    | ✅             | Regex                                                 |
| ❌    | ✅             | Retained Regex lastIndex                              |
| ❌    | ✅             | Regex Arbitrary Attached Data                         |
| ❌    | ✅             | Regex Self-Containment                                |
| ❌    | ✅             | Dates                                                 |
| ❌    | ✅             | Invalid Dates                                         |
| ❌    | ✅             | Date Arbitrary Attached Data                          |
| ❌    | ✅             | Date Self-Containment                                 |
| ❌    | ✅             | Symbols                                               |
| ❌    | ✅             | Registered Symbols                                    |
| ❌    | ✅             | Symbols With Retained Identifiers                     |
| ❌    | ✅             | Function Expressions                                  |
| ❌    | ✅             | Named Function Expressions                            |
| ❌    | ✅             | Arrow Functions                                       |
| ❌    | ✅             | Method Functions                                      |
| ❌    | ✅             | Function Expression Arbitrary Attached Data           |
| ❌    | ✅             | Function Expression Self-Containment                  |
| ❌    | ✅             | Named Function Expression Attached Data Referencing   |
| ✅    | ✅             | Objects                                               |
| ❌    | ✅             | Symbol Keys in Objects                                |
| ✅    | ✅             | Arrays                                                |
| ❌ *  | ✅             | Sparse Arrays                                         |
| ❌    | ✅             | Arrays with String and Symbol keys                    |
| ✅    | ✅             | Arbitrarily Deep Nesting                              |
| ❌    | ✅             | Circular References                                   |
| ❌    | ✅             | Shared Key and Value Symbol References                |
| ❌    | ✅             | Referencial Integrity for All Reference Types         |
| ✅ ** | ✅             | Top-Level Encoding for All Supported Values           |
| ❌    | ✅             | Simple Decoder Error Recovery                         |
| ✅    | ❌             | Built-in                                              |

* \* JSON will encode sparse arrays by injecting null values into the unassigned indices
* \** JSON will do top-level encoding only for the types it supports elsewhere


---

## Install

```
npm i
```


## Run Tests

```
npm run test
```


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



### File
TODO


### Blob
TODO


### Int8Array
TODO


### Uint8Array
TODO


### Uint8ClampedArray
TODO


### Int16Array
TODO


### Uint16Array
TODO


### Int32Array
TODO


### Uint32Array
TODO


### Float32Array
TODO


### Float64Array
TODO


### ArrayBuffer
TODO


### Map
TODO


### Set
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
