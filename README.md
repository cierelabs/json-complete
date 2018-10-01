# json-complete

An encoder that can turn any standard JavaScript object or value into a form that can be serialized by JSON, and do the reverse with a decoder. This includes preserving referential integrety and deduplication of data in the encoded output.

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
  - `+0`
  - `Infinity`
  - `-Infinity`
  - `NaN`
* Can also be specified with alternative literals, but these do not affect the value
  - binary (0b_)
  - octal (0_, 000_ and 0o_)
  - hexidecimal (0x_)

### Regex
* Regular pattern specified with slashes and optional flags afterward
* Regex to string => String(REGEX) and copy lastIndex if flags contains 'y' for sticky
* String representation to Regex => new Regex(STRING, flags), then, if flags contains 'y' for sticky, apply the lastIndex to the generated regex

### Date
* Object containing date/time data
* Date to string => DATE.getTime()
* String to Date => new Date(STRING)

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
* Can be sparse, in which case, when converting to string, store undefined in cells in-between the maximum index extents that don't have values

### Function
* Can save function expression, but will only be useful if the function is pure and side-effect free
* Function to string => String(FUNCTION_REF)
* String to Function => var o; eval(`o.f = ${FUNCTION_STRING};`); return o.f;


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



File
Blob
Special Multivalues - like adding a string key to an array

Special cases
typeof new Boolean(true) === 'object';
typeof new Number(1) === 'object';
typeof new String('abc') === 'object';