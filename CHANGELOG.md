## 2.0.0 (February ??th, 2019)

* Breaking Change: Completely reworked the encoded data format to greatly increase compression of data. It now rivals the size of the equivalent JSON encoded data, in spite of storing more information.
* Created conversion script (`convertTo.js`) that can convert back and forth between 1.0.0 and 2.0.0 json-complete data formats.
* Added support for BigInt64Array type.
* Added support for BigUint64Array type.
* Added support for IE11.
* Added support for IE10.
* Added support for IE9.
* Added Compat Mode support for environments decoding RegExp objects containing Sticky or Unicode flags.
* Improved testing support for Node.
* Reduced code duplication and improved compatibility in tests.
* Updated documentation with encoded format definition, type and feature support per environment, and other changes from above changes to the codebase.


## 1.0.2 (December 11th, 2018)

* Trying to get all NPM settings and tags correct


## 1.0.1 (December 11th, 2018)

* Small changes for NPM's benefit


## 1.0.0 (December 7th, 2018)

* Initial public release