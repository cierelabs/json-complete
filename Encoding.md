# Pointers

Each Pointer is a reference to something else in the data. It is made of two parts: the Key (type) and the Index where that type is in the data.

## Key (type)

The Key is a string that defines which type is used. It is encoded as one or more capital letters (A-Z), as well as dollar ($) for Simple Types.

Any number of letters can be used to refer to the type, but most single characters are reserved as follows:

* A - Array
* B - Wrapped Boolean
* C - RESERVED FOR FUTURE USE
* D - Date
* E - Error
* F - RESERVED FOR FUTURE USE
* G - Wrapped String
* H - Wrapped Number
* I - BigInt
* J - RESERVED FOR FUTURE USE
* K - RESERVED FOR FUTURE USE
* L - RESERVED FOR FUTURE USE
* M - RESERVED FOR FUTURE USE
* N - Number
* O - Object
* P - Symbol
* Q - Arguments
* R - Regexp
* S - String
* T - RESERVED FOR FUTURE USE
* U - Set
* V - Map
* W - ArrayBuffer
* X - SharedArrayBuffer
* Y - Blob
* Z - File
* I - BigInt
* UE - Uint8Array
* UC - Uint8ClampedArray
* US - Uint16Array
* UT - Uint32Array
* IE - Int8Array
* IS - Int16Array
* IT - Int32Array
* FT - Float32Array
* FS - Float64Array
* BI - BigInt64Array
* BU - BigUint64Array

* **All other sequences that start with a capital letter (not $), are RESERVED FOR FUTURE USE.**


### Simple Type Keys

Some types are unique value types or special case numbers. These are encoded separately using an underscore for the overall type and a digit to indicate which one. Future Simple Types may use higher digits. Future Simple Types may also be made user-definable.

* $0 - `undefined`
* $1 - `null`
* $2 - `true`
* $3 - `false`
* $4 - `Infinity`
* $5 - `-Infinity`
* $6 - `NaN`
* $7 - `-0`



## Index

The index is a number, stored in a custom Base64 form, which uses the digits (0-9), lowercase letters (a-z), and several standard punctuation characters:

```
!#%&'()*+-./:;<=>?@[]^_`{|}~
```

This results in the first 64 indices of a given Type will only use a single digit to store the index, rather than 2. This cost savings adds up the more Pointers are used. The encoding to Base64 was adapted from [here](https://stackoverflow.com/a/47896183).



## Combination

Using the above encoding of Keys and Indices, Pointers are stored very efficiently.

The characters backslash (\), double quote ("), comma (,), and space ( ) are not used in either the Key or the Index portion. Double quotes signify the boundaries of a JSON string component, and to use them as a value would require escaping, adding an extra character. Backslash would also require an extra escape character. These values are therefore avoided to keep the encoded size down to single characters as much as possible.

Seperate sections of a given type object will be separated by a space, while seperate instances of each type will be separated by a comma, including Number and BigInt types. Symbols and Strings retain their Array encoding, because they can potentially contain a comma or space character naturally.