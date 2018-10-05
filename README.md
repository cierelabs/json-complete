# json-complete

An encoder that can turn any standard JavaScript object or value into a form that can be serialized by JSON, and do the reverse with a decoder. This includes preserving referential integrity and deduplication of data in the encoded output.

## Referential Integrity

Any reference type that points to the same memory location will be encoded as the same pointer string in the data. When decoding, these shared pointer strings will allow shared references to be retained.

## Deduplication

Since values are being converted to references first, all value of a given type are encoded together, and are therefore deduplicated. No matter how many times a unique value is used, it will only be stored once. This includes strings and numbers.

## Encode to JSON

The encoder is a pre-process step to make the non-JSON encodable data suitable for encoding as standard JSON. All values, objects, etc are encoded to JSON-legal numbers, strings, arrays, and a single top-level object.

## Comparison to JSON

| json | json-complete | Feature                                               |
|------|---------------|-------------------------------------------------------|
| ❌    | ✅             | undefined                                             |
| ✅    | ✅             | null                                                  |
| ✅    | ✅             | Booleans                                              |
| ✅    | ✅             | Normal Numbers                                        |
| ❌    | ✅             | Number: NaN                                           |
| ❌    | ✅             | Number: -Infinity                                     |
| ❌    | ✅             | Number: Infinity                                      |
| ❌    | ✅             | Number: -0                                            |
| ✅    | ✅             | Strings                                               |
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

### String
* Stores text
* All strings are immutable
* Two instances of the same string share a reference to the same global string
* Can hold unicode symbols without special conversions or encodings

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

* Object wrapping primitives can cause non-standard objects that need to also store a value. For example, in `var test = new Number(3);`, `test` will store an object, to which arbitrary key/value pairs can be added. However, running `test.valueOf()` will return `3`.
* There are additional function forms like async functions, getters, and setters to consider.
* Switch all valueOf(), forEach(), etc functions to use the built in prototype version, so shenanigans with overwritten method functions on objects can't interfere with encoding and decoding.
* Convert top level data object to array instead, reducing all usage to arrays, strings, and numbers.
* Since functions can be encoded, the decoder for a given set of data can be included.

## Number Object

```
var test1 = new Number(3);
typeof test1 === 'object'
test1.valueOf() === 3
```

Primitive types that cannot have arbitrary keys
```
var test_un = void 0;
test_un.x = 2; // => TypeError

var test_nl = null;
test_nl.x = 2; // => TypeError

var test_bt = true;
test_bt.x = 2;
console.log(test_bt.x); // => undefined

var test_nm = 1;
test_nm.x = 2;
console.log(test_nm.x); // => undefined

var test_st = '1';
test_st.x = 2;
console.log(test_st.x); // => undefined

var test_sy = Symbol();
test_sy.x = 2;
console.log(test_sy.x); // => undefined
```

Primitive types that can have arbitrary keys
```
var test_re = /\s+/g;
test_re.x = 2;
console.log(test_re.x); // => 2
console.log(Object.prototype.valueOf.call(test_re) === test_re); // => true
console.log(typeof test_re); // => 'object'

var test_da = new Date();
test_da.x = 2;
console.log(test_da.x); // => 2
console.log(Object.prototype.valueOf.call(test_da) === test_da); // => true
console.log(typeof test_da); // => 'object'

var test_fu = () => { return 1; };
test_fu.x = 2;
console.log(test_fu.x); // => 2
console.log(Object.prototype.valueOf.call(test_fu) === test_fu); // => true
console.log(typeof test_fu); // => 'function'
```

Symbols cannot accept arbitrary Keys
```
var test_sy_key = Symbol();
test_sy_key.x = 2;
console.log(test_sy_key.x); // => undefined
```

Primitives with Object wrappers
```
var test_w_bt = new Boolean(true);
test_w_bt.x = 2;
console.log(test_w_bt.x); // => 2
console.log(test_w_bt.valueOf()); // => true
console.log(test_w_bt.valueOf() === test_w_bt); // => false
console.log(typeof test_w_bt); // => 'object'
console.log(Object.prototype.toString.call(test_w_bt)); // => '[object Boolean]'

var test_w_nm = new Number(1);
test_w_nm.x = 2;
console.log(test_w_nm.x); // => 2
console.log(test_w_nm.valueOf()); // => 1
console.log(test_w_nm.valueOf() === test_w_nm); // => false
console.log(typeof test_w_nm); // => 'object'
console.log(Object.prototype.toString.call(test_w_nm)); // => '[object Number]'

var test_w_st = new String('1');
test_w_st.x = 2;
console.log(test_w_st.x); // => 2
console.log(test_w_st.valueOf()); // => '1'
console.log(test_w_st.valueOf() === test_w_st); // => false
console.log(typeof test_w_st); // => 'object'
console.log(Object.prototype.toString.call(test_w_st)); // => '[object String]'

var test_w_sy = new Symbol(); // => TypeError
```

Arrays with arbitrary keys
```
var array_key_symbol = Symbol();
var test_ar = [1, 2, 3];
test_ar.x = 5;
test_ar[array_key_symbol] = 6;
console.log(test_ar.x); // => 5
console.log(test_ar[array_key_symbol]); // => 6
console.log(test_ar); // => [1, 2, 3, x: 5, Symbol(): 6]
console.log(Object.prototype.valueOf.call(test_ar) === test_ar); // => true
console.log(typeof test_ar); // => 'object'
console.log(Object.prototype.toString.call(test_ar)); // => '[object Array]'
Object.keys(test_ar); // => ["0", "1", "2", "x"]
Object.getOwnPropertySymbols(test_ar); // => [Symbol()]

var array_w_key_symbol = Symbol();
var test_w_ar = new Array(1, 2, 3);
test_w_ar.x = 5;
test_w_ar[array_w_key_symbol] = 6;
console.log(test_w_ar.x); // => 5
console.log(test_w_ar[array_w_key_symbol]); // => 6
console.log(test_w_ar); // => [1, 2, 3, x: 5, Symbol(): 6]
console.log(Object.prototype.valueOf.call(test_w_ar) === test_w_ar); // => true
console.log(typeof test_w_ar); // => 'object'
console.log(Object.prototype.toString.call(test_w_ar)); // => '[object Array]'
Object.keys(test_w_ar); // => ["0", "1", "2", "x"]
Object.getOwnPropertySymbols(test_w_ar); // => [Symbol()]
```

