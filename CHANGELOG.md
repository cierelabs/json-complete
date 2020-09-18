## 2.0.1 (September 17th, 2020)

* Minor Bugfix Breaking Change: For ArrayBuffers and SharedArrayBuffers, the Tape testing framework did not previously notice inequalities between such objects with integer keys and those without.
  - For these two types of objects, there are no integer keys like Arrays, and any attached index keys are actually in the form of string keys.
  - Thus, the output from json-complete v2.0.0, and v3.0.0 and above, could vary slightly if integer keys were added to ArrayBuffers or SharedArrayBuffers.
  - The chances of this actually occuring is near-zero, so no additional `convertTo.js` functionality was added.
* New support in Safari 14 for BigInt surfaced a bug in Safari when dealing with function-created BigInt keys in Maps.
  - Forward-compatible test was added for selecting the Reference tracker to fall back for this issue.
  - See bug report: https://bugs.webkit.org/show_bug.cgi?id=216667
* Fixed display of license comments in published files.
* Updated build numbers, feature compatibility, and testing results to match newer browser versions.
* Officially dropped intent to create legacy version to support IE6, IE7, and IE8.
* Updated build system to reduce friction with updates, including moving all but `tape` import and `gulpfile.js` functionality to ES Module form.
* Updated all dependencies as much as possible.


## 2.0.0 (July 23rd, 2019)

* Breaking Change: Completely reworked the encoded data format to greatly increase compression of data. It now rivals the size of the equivalent JSON encoded data, in spite of storing more information.
  - Part of the rework reserves some keys for future use such as custom types and new primitives in JS.
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
* Identified several improvements to be made and added them to the Future Plans section.


## 1.0.2 (December 11th, 2018)

* Trying to get all NPM settings and tags correct


## 1.0.1 (December 11th, 2018)

* Small changes for NPM's benefit


## 1.0.0 (December 7th, 2018)

* Initial public release