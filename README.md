# json-complete

An encoder that can turn any standard JavaScript object or value into a form that can be serialized by JSON, and do the reverse with a decoder. This includes preserving referential integrity and deduplication of data in the encoded output.

## Referential Integrity

Any reference type that points to the same memory location will be encoded as the same pointer string in the data. When decoding, these shared pointer strings will allow shared references to be retained.

## Deduplication

Since values are being converted to references first, all value of a given type are encoded together, and are therefore deduplicated. No matter how many times a unique value is used, it will only be stored once. This includes strings and numbers.

## Encode to JSON

The encoder is a pre-process step to make the non-JSON encodable data suitable for encoding as standard JSON. All values, objects, etc are encoded to JSON-legal numbers, strings, arrays, and a single top-level object.

## Comparison to JSON

| json | json-complete | Feature                                       |
|------|---------------|-----------------------------------------------|
| ❌    | ✅             | undefined                                     |
| ✅    | ✅             | null                                          |
| ✅    | ✅             | Booleans                                      |
| ✅    | ✅             | Normal Numbers                                |
| ❌    | ✅             | Number: NaN                                   |
| ❌    | ✅             | Number: -Infinity                             |
| ❌    | ✅             | Number: Infinity                              |
| ❌    | ✅             | Number: -0                                    |
| ✅    | ✅             | Strings                                       |
| ❌    | ✅             | Regex                                         |
| ❌    | ✅             | Retained Regex lastIndex                      |
| ❌    | ✅             | Dates                                         |
| ❌    | ✅             | Invalid Dates                                 |
| ❌    | ✅             | Symbols                                       |
| ❌    | ✅             | Registered Symbols                            |
| ❌    | ✅             | Function Expressions                          |
| ❌    | ✅             | Named Function Expressions                    |
| ❌    | ✅             | Arrow Functions                               |
| ❌    | ✅             | Method Functions                              |
| ✅    | ✅             | Objects                                       |
| ❌    | ✅             | Symbol Keys in Objects                        |
| ✅    | ✅             | Arrays                                        |
| ❌ *  | ✅             | Sparse Arrays                                 |
| ✅    | ✅             | Arbitrarily Deep Nesting                      |
| ❌    | ✅             | Circular References                           |
| ❌    | ✅             | Shared Key and Value Symbol References        |
| ❌    | ✅             | Referencial Integrity for All Reference Types |
| ✅ ** | ✅             | Top-Level Encoding for All Supported Values   |
| ❌    | ✅             | Simple Decoder Error Recovery                 |

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

### Date
* Object containing date/time data
* Date to Number => DATE.getTime()
* Number to Date => new Date(TIME_NUMBER)
* Note: If a Date was constructed with a value that cannot be converted into a date, the result is a Date Object with a value of "Invalid Date".
  - This can be detected by checking for NaN value when calling getTime()
  - Invalid Date objects do not equal each other by default
  - This type of Date object can be encoded with any non-number value

### Object
* key/value pairs
* key can be a String or Symbol
* value can be anything, including a reference to the parent object

### Symbol
* Globally unique value, usually
* Can be used as an Object key
* Creating Symbol by using Symbol() or Symbol(SOME_STRING) will always be unique, even if the SOME_STRING is used elsewhere
* Creating Symbol by using Symbol.for(SOME_STRING) will create a shared Symbol with any other Symbol created with the same SOME_STRING using .for()
* Passing a non-string to .for() will convert the value to a string using the String constructor
* If the Symbol is shared, calling Symbol.keyFor(SOME_SYMBOL) will result in the string key vale for that Symbol

### Array
* A set of indexed values
* Can store anything, including a reference to the array object
* Can be a sparce array, so only store values at used indices

### Function
* Can save function expression, but will only be useful if the function is pure and side-effect free
* TODO: There are many different function forms, each with different encoding and decoding aspects

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

* Many Object-based types, such as Dates, Arrays, Functions, and Regex can accept arbitrary keys onto themselves as if they were plain objects, while retaining their value and type. This can be encoded by adding an additional, optional pair set to these encode/decode functions.
* Object wrapping primitives can cause non-standard objects that need to also store a value. For example, in `var test = new Number(3);`, `test` will store an object, to which arbitrary key/value pairs can be added. However, running `test.valueOf()` will return `3`.
* Symbols made with the construtor can accept arbitrary strings for identification purposes that do not affect their uniqueness. This information needs to also be stored to completely duplicate the value.
* The Method form of function definitions inside objects can currently be encoded. However, the decoder does not reconstruct the value exactly the same way, but instead recreates the same behavior using a key/value pair. This could be accounted for by special casing the object generation in the decoder.
* There are additional function forms like async functions, getters, and setters to consider.

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

var test_Bt = true;
test_Bt.x = 2;
console.log(test_Bt.x); // => undefined

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
console.log(test_re.valueOf() === test_re); // => true
console.log(typeof test_re); // => 'object'

var test_da = new Date();
test_da.x = 2;
console.log(test_da.x); // => 2
console.log(test_da.valueOf() === test_da); // => false !!!
console.log(typeof test_da); // => 'object'

var test_fu = () => { return 1; };
test_fu.x = 2;
console.log(test_fu.x); // => 2
console.log(test_fu.valueOf() === test_fu); // => true
console.log(typeof test_fu); // => 'function'
```

Primitives with Object wrappers
```
var test_w_Bt = new Boolean(true);
test_w_Bt.x = 2;
console.log(test_w_Bt.x); // => 2
console.log(test_w_Bt.valueOf()); // => true
console.log(test_w_Bt.valueOf() === test_w_Bt); // => false
console.log(typeof test_w_Bt); // => 'object'
console.log(Object.prototype.toString.call(test_w_Bt)); // => '[object Boolean]'

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
console.log(test_ar.valueOf() === test_ar); // => true
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
console.log(test_w_ar.valueOf() === test_w_ar); // => true
console.log(typeof test_w_ar); // => 'object'
console.log(Object.prototype.toString.call(test_w_ar)); // => '[object Array]'
Object.keys(test_w_ar); // => ["0", "1", "2", "x"]
Object.getOwnPropertySymbols(test_w_ar); // => [Symbol()]
```

