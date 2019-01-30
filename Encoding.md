## Pointers

Each Pointer is a reference to something else in the data. It is made of two parts: the Key (type) and the Index where that type is in the data.

### Key (type)

The Key is a string that defines which type is used. It is encoded as one or more capital letters (A-Z), an underscore (_), or a dollar sign ($). Underscore and dollar sign can be used as object keys in JS, which is why they are used in addition to capital letters. The type layout is as follows.

* A - Array
* B - Wrapped Boolean
* C - NaN
* D - Date
* E - Error
* F - false
* G - Wrapped String
* H - Wrapped Number
* I - Infinity
* J - -Infinity
* K - undefined
* L - null
* M - -0
* N - Number
* O - Object
* P - Symbol
* Q - Arguments
* R - Regexp
* S - String
* T - true
* U - Set
* V - Map
* W - ArrayBuffer
* X - SharedArrayBuffer
* Y - Blob
* Z - File
* _ - BigInt
* $ - Uint8Array
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

### Index

The index is a number, stored in Base63, which uses the digits (0-9), lowercase letters (a-z), and several standard punctuation characters.

```
!#%&'()*+-./:;<=>?@[]^`{|}~
```

The encoding to Base63 was adapted from [here](https://stackoverflow.com/a/47896183).

### Combination

Using the above encoding of Keys and Indices, Pointers are effectively stored using Base91 encoding.

The characters backslash (\), double quote ("), comma (,), and space ( ) are not used in either the Key or the Index portion. Double quotes signify the boundaries of a JSON string component, and to use them as a value would require escaping, adding an extra character. Backslash would also require an extra escape character. These values are therefore avoided to keep the encoded size down to single characters as much as possible.

Seperate sections of a given type object will be separated by a space, while seperate instances of each type will be separated by a comma, including Number and BigInt types. Symbols and Strings retain their Array encoding, because they can potentially contain a comma or space character naturally.