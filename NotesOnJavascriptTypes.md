# Data about JS Types for storage

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
  - Invalid Date objects created separately do not equal each other by default
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
* Symbol references can be duplicated, however, and will show being equal to themselves. `var sym = new Symbol(); console.log(sym === sym); // true`
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
* Optionally, non-integer String and Symbol keys can be attached to the Array, because it is built on Object.
* Specifying integer keys as Strings will overwrite/create refer to the integer position in the Array, not the String key. That is, String keys of integers cannot be used with Arrays.
  - Even if specifying a key outside the range using an int converted to string will result in the creation of a sparce array with integer key.

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

### ArrayBuffer
TODO

### SharedArrayBuffer
TODO

### Set
TODO

### Map
TODO

### Blob
TODO

### File
TODO

### BigInt
TODO
