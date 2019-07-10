'use strict'; // Custom Base64 Alphabet

var alphabet = "0123456789abcdefghijklmnopqrstuvwxyz!#%&'()*+-./:;<=>?@[]^_`{|}~"; // eslint-disable-line quotes

var splitPointers = function splitPointers(pointerString) {
  return pointerString.split(/([A-Z$]+)/);
};

var extractPointer = function extractPointer(pointer) {
  var parts = splitPointers(pointer);
  return {
    _key: parts[1],
    _index: Number(parts[2])
  };
};

var toBase = function toBase(number, alphabet) {
  var result = '';
  var radix = alphabet.length;

  do {
    result = alphabet[number % radix] + result;
    number = Math.floor(number / radix);
  } while (number);

  return result;
};

var compressValues = function compressValues(key, value, types) {
  // Unrecognized Types, Strings, and Symbols get no additional compression
  if (!types[key] || types[key]._compressionType === 0) {
    return value;
  } // Join Numbers and BigInts using comma, strings need to stay in Array form


  if (types[key]._compressionType === 1) {
    return value.join(',');
  } // Convert all indices to Base string notation, separate item parts with comma, and separate items with space


  return value.map(function (outerArray) {
    return outerArray.map(function (innerArray) {
      return innerArray.map(function (pointer) {
        var parts = extractPointer(pointer);
        return parts._key + toBase(parts._index, alphabet);
      }).join('');
    }).join(' ');
  }).join(',');
};

var getSystemName = function getSystemName(v) {
  return Object.prototype.toString.call(v).slice(8, -1);
};

var getItemKey = function getItemKey(store, item) {
  // Simple Types
  for (var t = 0; t < store._simpleTypes.length; t += 1) {
    if (store._simpleTypes[t][0](item)) {
      return store._simpleTypes[t][1];
    }
  } // In IE11, Set and Map are supported, but they do not have the expected System Name


  if (typeof Set === 'function' && item instanceof Set) {
    return 'U';
  }

  if (typeof Map === 'function' && item instanceof Map) {
    return 'V';
  }

  var systemName = getSystemName(item);
  var wrappedTypeSystemName = store._wrappedTypeMap[systemName];

  if (wrappedTypeSystemName && typeof item === 'object') {
    systemName = wrappedTypeSystemName;
  }

  return store._typeMap[systemName];
};

var canUseNormalMap = function canUseNormalMap(encodeSymbolKeys) {
  // Map not supported at all or is some kind of polyfill, ignore
  if (typeof Map !== 'function' || getSystemName(new Map()) !== 'Map') {
    return false;
  } // Even though Maps are supported, Symbols are not supported at all or we are ignoring Symbol keys, so assume Map works normally
  // Even if Symbols are used after this point, it will error out somewhere else anyway


  if (typeof Symbol !== 'function' || getSystemName(Symbol()) !== 'Symbol' || !encodeSymbolKeys) {
    return true;
  } // Versions of Microsoft Edge before 18 support both Symbols and Maps, but can occasionally (randomly) allow Map keys to be duplicated if they are obtained from Object keys
  // Here, the code statistically attempts to detect the possibility of key duplication
  // With 50 set operations, the chances of a successfully detecting this failure case is at least 99.999998% likely
  // https://github.com/Microsoft/ChakraCore/issues/5852


  var obj = {};
  obj[Symbol()] = 1;
  var box = new Map();

  for (var i = 0; i < 50; i += 1) {
    box.set(Object.getOwnPropertySymbols(obj)[0], {});
  }

  return box.size === 1;
};

var genReferenceTracker = function genReferenceTracker(encodeSymbolKeys) {
  // TODO: Exclude entirely from legacy version
  // For modern browsers that both support Map and won't be tripped up by special kinds of Symbol keys, using a Map to store the references is far faster than an array because it allows for roughly O(1) lookup time when checking for duplicate keys
  if (canUseNormalMap(encodeSymbolKeys)) {
    var references = new Map();
    return {
      _get: function _get(item) {
        return references.get(item);
      },
      _set: function _set(item, dataItem) {
        references.set(item, dataItem);
      },
      _resumableForEach: function _resumableForEach(callback, resumeFromIndex) {
        resumeFromIndex = resumeFromIndex || 0;
        var count = 0;
        references.forEach(function (dataItem) {
          // count will never be greater than resumeFromIndex when not encoding a deferred type, which Node doesn't support

          /* istanbul ignore else */
          if (count >= resumeFromIndex) {
            callback(dataItem);
          }

          count += 1;
        });
        return count;
      }
    };
  } // In the fallback legacy mode, uses an array instead of a Map
  // The items cannot be broken up by type, because their insertion order matters to the algorithm
  // There were plans to make the array "infinite" in size by making nested arrays, however even under the smallest forms of objects, browsers can't get anywhere near full array usage before running out of memory and crashing the page


  var items = [];
  var dataItems = [];
  return {
    _get: function _get(item) {
      for (var i = 0; i < items.length; i += 1) {
        if (items[i] === item) {
          return dataItems[i];
        }
      }
    },
    _set: function _set(item, dataItem) {
      items.push(item);
      dataItems.push(dataItem);
    },
    _resumableForEach: function _resumableForEach(callback, resumeFromIndex) {
      var count;

      for (count = resumeFromIndex || 0; count < dataItems.length; count += 1) {
        callback(dataItems[count]);
      }

      return count;
    }
  };
};

var getAttachments = function getAttachments(item, encodeSymbolKeys) {
  // Find all indices
  var indices = [];
  var indexObj = {}; // Objects not based on Arrays, like Objects and Sets, will not find any indices here because we are using the Array.prototype.forEach

  Array.prototype.forEach.call(item, function (value, index) {
    indexObj[String(index)] = 1;
    indices.push(index);
  }); // Find all String keys that are not indices
  // For Arrays, TypedArrays, and Object-Wrapped Strings, the keys list will include indices as strings, so account for that by checking the indexObj

  var keys = Object.keys(item).filter(function (key) {
    return !indexObj[key];
  });

  if (encodeSymbolKeys && typeof Symbol === 'function') {
    keys = keys.concat(Object.getOwnPropertySymbols(item).filter(function (symbol) {
      // Ignore built-in Symbols
      // If the Symbol ID that is part of the Symbol global is not equal to the tested Symbol, then it is NOT a built-in Symbol
      return Symbol[String(symbol).slice(14, -1)] !== symbol;
    }));
  } // Have to use external index iterator because we want the counting to stop once the first index incongruity occurs


  var i = 0; // Create the lists

  return indices.concat(keys).reduce(function (accumulator, key) {
    if (key === i) {
      i += 1;

      accumulator._indices.push(item[key]);
    } else {
      accumulator._keys.push(key);

      accumulator._values.push(item[key]);
    }

    return accumulator;
  }, {
    _indices: [],
    _keys: [],
    _values: []
  });
}; // This is the function for getting pointer references in the build functions


var getDecoded = function getDecoded(store, pointer) {
  // Simple type, return the value
  if (store._types[pointer]) {
    return store._types[pointer]._value;
  } // Normal type, return the reference


  var p = extractPointer(pointer);

  if (store._types[p._key]) {
    return store._decoded[pointer]._reference;
  } // We will never reach this point without being in compat mode, return the pointer string


  return pointer;
};

var attachIndices = function attachIndices(store, dataItem) {
  for (var i = 0; i < dataItem._parts[0].length; i += 1) {
    dataItem._reference[i] = getDecoded(store, dataItem._parts[0][i]);
  }
};

var attachKeys = function attachKeys(store, dataItem, keyIndex, valueIndex) {
  for (var i = 0; i < (dataItem._parts[keyIndex] || []).length; i += 1) {
    var keyPointer = dataItem._parts[keyIndex][i]; // In compat mode, if Symbol types are not supported, but the encoded data uses a Symbol key, skip this entry

    if (!store._compat || typeof Symbol === 'function' || extractPointer(keyPointer)._key !== 'P') {
      dataItem._reference[getDecoded(store, keyPointer)] = getDecoded(store, dataItem._parts[valueIndex][i]);
    }
  }
}; // This is the function for getting pointer values in the generateReference functions


var decodePointer = function decodePointer(store, pointer) {
  if (store._types[pointer]) {
    return store._types[pointer]._value;
  }

  var p = extractPointer(pointer);
  return store._types[p._key]._generateReference(store, store._encoded[p._key][p._index]);
};

var encodeWithAttachments = function encodeWithAttachments(encodedBase, attachments) {
  return attachments._keys.length === 0 ? encodedBase : encodedBase.concat([attachments._keys, attachments._values]);
};

var genArrayBuffer = function genArrayBuffer(type) {
  return {
    _systemName: getSystemName(new type()),
    _compressionType: 2,
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([Array.prototype.slice.call(new Uint8Array(reference))], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      var encodedValues = dataItems[0];
      var buffer = new type(encodedValues.length);
      var view = new Uint8Array(buffer);
      encodedValues.forEach(function (pointer, index) {
        view[index] = decodePointer(store, pointer);
      });
      return buffer;
    },
    _build: function _build(store, dataItem) {
      attachIndices(store, dataItem);
      attachKeys(store, dataItem, 1, 2);
    }
  };
};

var ArrayBufferTypes = function ArrayBufferTypes(typeObj) {
  /* istanbul ignore else */
  if (typeof ArrayBuffer === 'function') {
    typeObj.W = genArrayBuffer(ArrayBuffer);
  } // Support does not exist or was removed from most environments due to Spectre and Meltdown vulnerabilities
  // https://caniuse.com/#feat=sharedarraybuffer

  /* istanbul ignore else */


  if (typeof SharedArrayBuffer === 'function') {
    typeObj.X = genArrayBuffer(SharedArrayBuffer);
  }

  return typeObj;
};

var ArrayLikeTypes = function ArrayLikeTypes(typeObj) {
  typeObj.A = {
    _systemName: 'Array',
    _compressionType: 2,
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([attachments._indices], attachments);
    },
    _generateReference: function _generateReference() {
      return [];
    },
    _build: function _build(store, dataItem) {
      attachIndices(store, dataItem);
      attachKeys(store, dataItem, 1, 2);
    }
  };
  typeObj.Q = {
    _systemName: 'Arguments',
    _compressionType: 2,
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([attachments._indices], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      return function () {
        return arguments;
      }.apply(null, Array(dataItems[0].length));
    },
    _build: function _build(store, dataItem) {
      attachIndices(store, dataItem);
      attachKeys(store, dataItem, 1, 2);
    }
  };
  return typeObj;
};

var genPrimitive = function genPrimitive(type, compressionType) {
  return {
    _systemName: getSystemName(type('')),
    _compressionType: compressionType || 0,
    _isAttachless: 1,
    _encodeValue: function _encodeValue(reference) {
      return String(reference);
    },
    _generateReference: function _generateReference(store, dataItems) {
      return type(dataItems);
    },
    _build: function _build() {}
  };
};

var BasePrimitiveTypes = function BasePrimitiveTypes(typeObj) {
  typeObj.S = genPrimitive(String);
  typeObj.N = genPrimitive(Number, 1);
  return typeObj;
};

var genTypedArray = function genTypedArray(type) {
  return {
    _systemName: getSystemName(new type()),
    _compressionType: 2,
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([attachments._indices], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      return new type(dataItems[0].length);
    },
    _build: function _build(store, dataItem) {
      attachIndices(store, dataItem);
      attachKeys(store, dataItem, 1, 2);
    }
  };
};

var BigIntType = function BigIntType(typeObj) {
  /* istanbul ignore else */
  if (typeof BigInt === 'function') {
    typeObj.I = genPrimitive(BigInt, 1);
  }
  /* istanbul ignore else */


  if (typeof BigInt64Array === 'function') {
    typeObj.BI = genTypedArray(BigInt64Array);
  }
  /* istanbul ignore else */


  if (typeof BigUint64Array === 'function') {
    typeObj.BU = genTypedArray(BigUint64Array);
  }

  return typeObj;
};
/* istanbul ignore next */


var genBlobLike = function genBlobLike(systemName, propertiesKeys, create) {
  return {
    _systemName: systemName,
    _compressionType: 2,
    _encodeValue: function _encodeValue(reference, attachments) {
      // Skip the decoding of the main value for now
      return encodeWithAttachments([[void 0].concat(propertiesKeys.map(function (property) {
        return reference[property];
      }))], attachments);
    },
    _deferredEncode: function _deferredEncode(reference, dataArray, encoder, callback) {
      var reader = new FileReader();
      reader.addEventListener('loadend', function () {
        dataArray[0][0] = encoder(new Uint8Array(reader.result));
        callback();
      });
      reader.readAsArrayBuffer(reference);
    },
    _generateReference: function _generateReference(store, dataItems) {
      var p = extractPointer(dataItems[0][0]); // If we are decoding a Deferred Type that wasn't properly deferred, then the Uint8Array would never have gotten encoded
      // This will result in an empty Blob or File

      var dataArray = p._key === 'K' ? [] : store._encoded[p._key][p._index][0];
      return create(store, [new Uint8Array(dataArray.map(function (pointer) {
        return decodePointer(store, pointer);
      }))], dataItems[0]);
    },
    _build: function _build(store, dataItem) {
      attachKeys(store, dataItem, 1, 2);
    }
  };
};

var BlobTypes = function BlobTypes(typeObj) {
  // Supported back to IE10

  /* istanbul ignore if */
  if (typeof Blob === 'function') {
    typeObj.Y = genBlobLike('Blob', ['type'], function (store, buffer, dataArray) {
      return new Blob(buffer, {
        type: decodePointer(store, dataArray[1])
      });
    }); // Supported back to IE10, but IE10, IE11, and (so far) Edge do not support the File constructor, so they will use the fallback in compat mode

    typeObj.Z = genBlobLike('File', ['type', 'name', 'lastModified'], function (store, buffer, dataArray) {
      try {
        return new File(buffer, decodePointer(store, dataArray[2]), {
          type: decodePointer(store, dataArray[1]),
          lastModified: decodePointer(store, dataArray[3])
        });
      } catch (e) {
        // IE10, IE11, and Edge do not support the File constructor
        // In compat mode, decoding an encoded File object results in a Blob that is duck-typed to be like a File object
        // Such a Blob will still report its System Name as "Blob" instead of "File"
        if (store._compat) {
          var fallbackBlob = new Blob(buffer, {
            type: decodePointer(store, dataArray[1])
          });
          fallbackBlob.name = decodePointer(store, dataArray[2]);
          fallbackBlob.lastModified = decodePointer(store, dataArray[3]);
          return fallbackBlob;
        }

        throw e;
      }
    });
  }

  return typeObj;
};

var DateType = function DateType(typeObj) {
  typeObj.D = {
    _systemName: 'Date',
    _compressionType: 2,
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([[reference.valueOf()]], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      return new Date(decodePointer(store, dataItems[0][0]));
    },
    _build: function _build(store, dataItem) {
      attachKeys(store, dataItem, 1, 2);
    }
  };
  return typeObj;
};

var standardErrors = {
  'EvalError': EvalError,
  'RangeError': RangeError,
  'ReferenceError': ReferenceError,
  'SyntaxError': SyntaxError,
  'TypeError': TypeError,
  'URIError': URIError
};

var ErrorType = function ErrorType(typeObj) {
  typeObj.E = {
    _systemName: 'Error',
    _compressionType: 2,
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([[standardErrors[reference.name] ? reference.name : 'Error', reference.message, reference.stack]], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      var dataArray = dataItems[0];
      var value = new (standardErrors[decodePointer(store, dataArray[0])] || Error)(decodePointer(store, dataArray[1]));
      value.stack = decodePointer(store, dataArray[2]);
      return value;
    },
    _build: function _build(store, dataItem) {
      attachKeys(store, dataItem, 1, 2);
    }
  };
  return typeObj;
};

var KeyedCollectionTypes = function KeyedCollectionTypes(typeObj) {
  /* istanbul ignore else */
  if (typeof Set === 'function') {
    typeObj.U = {
      _systemName: 'Set',
      _compressionType: 2,
      _encodeValue: function _encodeValue(reference, attachments) {
        var data = [];
        reference.forEach(function (value) {
          data.push(value);
        });
        return encodeWithAttachments([data], attachments);
      },
      _generateReference: function _generateReference() {
        return new Set();
      },
      _build: function _build(store, dataItem) {
        dataItem._parts[0].forEach(function (pointer) {
          dataItem._reference.add(getDecoded(store, pointer));
        });

        attachKeys(store, dataItem, 1, 2);
      }
    };
  }
  /* istanbul ignore else */


  if (typeof Map === 'function') {
    typeObj.V = {
      _systemName: 'Map',
      _compressionType: 2,
      _encodeValue: function _encodeValue(reference, attachments) {
        var keys = [];
        var values = [];
        reference.forEach(function (value, key) {
          keys.push(key);
          values.push(value);
        });
        return encodeWithAttachments([keys, values], attachments);
      },
      _generateReference: function _generateReference() {
        return new Map();
      },
      _build: function _build(store, dataItem) {
        for (var i = 0; i < dataItem._parts[0].length; i += 1) {
          dataItem._reference.set(getDecoded(store, dataItem._parts[0][i]), getDecoded(store, dataItem._parts[1][i]));
        }

        attachKeys(store, dataItem, 2, 3);
      }
    };
  }

  return typeObj;
};

var ObjectType = function ObjectType(typeObj) {
  typeObj.O = {
    _systemName: 'Object',
    _compressionType: 2,
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([], attachments);
    },
    _generateReference: function _generateReference() {
      return {};
    },
    _build: function _build(store, dataItem) {
      attachKeys(store, dataItem, 0, 1);
    }
  };
  return typeObj;
};

var supportsFlag = function supportsFlag(flag) {
  try {
    var value = new RegExp(' ', flag);
    return getSystemName(value) === 'RegExp';
  } catch (e) {
    // Only false in IE11 and below

    /* istanbul ignore next */
    return false;
  }
};

var supportsSticky = supportsFlag('y');
var supportsUnicode = supportsFlag('u');

var RegExpType = function RegExpType(typeObj) {
  typeObj.R = {
    _systemName: 'RegExp',
    _compressionType: 2,
    _encodeValue: function _encodeValue(reference, attachments) {
      var flags = reference.flags; // Edge and IE use `options` parameter instead of `flags`, regardless of what it says on MDN

      /* istanbul ignore if */

      if (flags === void 0) {
        flags = reference.options;
      }

      return encodeWithAttachments([[reference.source, flags, reference.lastIndex]], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      var dataArray = dataItems[0];
      var flags = decodePointer(store, dataArray[1]); // Only applies to IE

      /* istanbul ignore next */

      if (store._compat) {
        if (!supportsSticky) {
          flags = flags.replace(/y/g, '');
        }

        if (!supportsUnicode) {
          flags = flags.replace(/u/g, '');
        }
      }

      var value = new RegExp(decodePointer(store, dataArray[0]), flags);
      value.lastIndex = decodePointer(store, dataArray[2]);
      return value;
    },
    _build: function _build(store, dataItem) {
      attachKeys(store, dataItem, 1, 2);
    }
  };
  return typeObj;
};

var genIsEqual = function genIsEqual(comparedTo) {
  return function (value) {
    return value === comparedTo;
  };
};

var SimpleTypes = function SimpleTypes(typeObj) {
  typeObj.$0 = {
    _identify: genIsEqual(void 0),
    _value: void 0
  };
  typeObj.$1 = {
    _identify: genIsEqual(null),
    _value: null
  };
  typeObj.$2 = {
    _identify: genIsEqual(true),
    _value: true
  };
  typeObj.$3 = {
    _identify: genIsEqual(false),
    _value: false
  };
  typeObj.$4 = {
    _identify: genIsEqual(Infinity),
    _value: Infinity
  };
  typeObj.$5 = {
    _identify: genIsEqual(-Infinity),
    _value: -Infinity
  };
  typeObj.$6 = {
    _identify: function _identify(value) {
      return value !== value;
    },
    _value: NaN
  };
  typeObj.$7 = {
    _identify: function _identify(value) {
      return value === 0 && 1 / value === -Infinity;
    },
    _value: -0
  };
  return typeObj;
};

var SymbolType = function SymbolType(typeObj) {
  /* istanbul ignore else */
  if (typeof Symbol === 'function') {
    typeObj.P = {
      _systemName: 'Symbol',
      _compressionType: 0,
      _isAttachless: 1,
      _encodeValue: function _encodeValue(reference) {
        var symbolStringKey = Symbol.keyFor(reference);
        var isRegistered = symbolStringKey !== void 0;
        return isRegistered ? "r" + symbolStringKey : "s" + String(reference).slice(7, -1);
      },
      _generateReference: function _generateReference(store, decodedString) {
        return decodedString[0] === 'r' ? Symbol.for(decodedString.slice(1)) : Symbol(decodedString.slice(1));
      },
      _build: function _build() {} // Symbols do not allow attachments, no-op

    };
  }

  return typeObj;
}; // Some TypedArray types are not supported by some browsers, so test for all
// https://caniuse.com/#feat=typedarrays


var TypedArrayTypes = function TypedArrayTypes(typeObj) {
  /* istanbul ignore else */
  if (typeof Int8Array === 'function') {
    typeObj.IE = genTypedArray(Int8Array);
  }
  /* istanbul ignore else */


  if (typeof Int16Array === 'function') {
    typeObj.IS = genTypedArray(Int16Array);
  }
  /* istanbul ignore else */


  if (typeof Int32Array === 'function') {
    typeObj.IT = genTypedArray(Int32Array);
  }
  /* istanbul ignore else */


  if (typeof Uint8Array === 'function') {
    typeObj.UE = genTypedArray(Uint8Array);
  }
  /* istanbul ignore else */


  if (typeof Uint8ClampedArray === 'function') {
    typeObj.UC = genTypedArray(Uint8ClampedArray);
  }
  /* istanbul ignore else */


  if (typeof Uint16Array === 'function') {
    typeObj.US = genTypedArray(Uint16Array);
  }
  /* istanbul ignore else */


  if (typeof Uint32Array === 'function') {
    typeObj.UT = genTypedArray(Uint32Array);
  }
  /* istanbul ignore else */


  if (typeof Float32Array === 'function') {
    typeObj.FT = genTypedArray(Float32Array);
  }
  /* istanbul ignore else */


  if (typeof Float64Array === 'function') {
    typeObj.FS = genTypedArray(Float64Array);
  }

  return typeObj;
};

var genWrappedPrimitive = function genWrappedPrimitive(type) {
  return {
    // Prefix of _ is used to differenciate the Wrapped Primitive vs the Primitive Type
    _systemName: "_" + getSystemName(new type('')),
    _compressionType: 2,
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([[reference.valueOf()]], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      return new type(decodePointer(store, dataItems[0][0]));
    },
    _build: function _build(store, dataItem) {
      attachKeys(store, dataItem, 1, 2);
    }
  };
};

var WrappedPrimitiveTypes = function WrappedPrimitiveTypes(typeObj) {
  typeObj.B = genWrappedPrimitive(Boolean);
  typeObj.G = genWrappedPrimitive(String);
  typeObj.H = genWrappedPrimitive(Number);
  return typeObj;
};

var types = {};
types = SimpleTypes(types);
types = BasePrimitiveTypes(types);
types = WrappedPrimitiveTypes(types);
types = ArrayLikeTypes(types);
types = ObjectType(types);
types = DateType(types);
types = RegExpType(types);
types = ErrorType(types); // TODO: Exclude entirely from legacy version

types = SymbolType(types);
types = KeyedCollectionTypes(types);
types = TypedArrayTypes(types);
types = ArrayBufferTypes(types);
types = BlobTypes(types);
types = BigIntType(types);
var types$1 = types;

var getPointerKey = function getPointerKey(store, item) {
  var pointerKey = getItemKey(store, item);

  if (!pointerKey && !store._compat) {
    var type = getSystemName(item);
    throw new Error("Cannot encode unsupported type \"" + type + "\".");
  } // In compat mode, Unsupported types are stored as plain, empty objects, so that they retain their referential integrity, but can still handle attachments


  return pointerKey ? pointerKey : 'O';
};

var encounterItem = function encounterItem(store, item) {
  var pointerKey = getPointerKey(store, item); // Simple type, return pointer (pointer key)

  if (!store._types[pointerKey]._build) {
    return pointerKey;
  } // Already encountered, return pointer


  var existingDataItem = store._references._get(item, pointerKey);

  if (existingDataItem !== void 0) {
    return existingDataItem._pointer;
  } // Ensure location exists


  store._output[pointerKey] = store._output[pointerKey] || []; // Add temp value to update the location

  store._output[pointerKey].push(0);

  var pointerIndex = store._output[pointerKey].length - 1;
  var dataItem = {
    _key: pointerKey,
    _index: pointerIndex,
    _pointer: pointerKey + pointerIndex,
    _reference: item
  }; // Store the reference uniquely along with location information

  store._references._set(item, dataItem); // Some values can only be obtained asynchronously, so add them to a list of items to check

  /* istanbul ignore next */


  if (store._types[pointerKey]._deferredEncode) {
    store._deferred.push(dataItem);
  }

  return dataItem._pointer;
};

var encodeAll = function encodeAll(store, resumeFromIndex) {
  return store._references._resumableForEach(function (dataItem) {
    var attachments = [];

    if (!types$1[dataItem._key]._isAttachless) {
      attachments = getAttachments(dataItem._reference, store._encodeSymbolKeys);
    }

    var encodedForm = types$1[dataItem._key]._encodeValue(dataItem._reference, attachments); // All types that encode directly to Strings (String, Number, BigInt, and Symbol) do not have attachments


    if (getSystemName(encodedForm) !== 'String') {
      // Encounter all data in the encoded form to get the appropriate Pointers and
      encodedForm = encodedForm.map(function (part) {
        return part.map(function (subPart) {
          return encounterItem(store, subPart);
        });
      });
    }

    store._output[dataItem._key][dataItem._index] = encodedForm;
  }, resumeFromIndex);
};

var prepOutput = function prepOutput(store, root) {
  // Convert the output object form to an output array form
  var output = JSON.stringify([root + ",2"].concat(Object.keys(store._output).map(function (key) {
    return [key, compressValues(key, store._output[key], store._types)];
  })));

  if (typeof store._onFinish === 'function') {
    store._onFinish(output);
  } else {
    return output;
  }
};

var encode = function encode(value, options) {
  options = options || {};
  var simpleTypes = [];
  var typeMap = {};
  var wrappedTypeMap = {};
  Object.keys(types$1).forEach(function (key) {
    if (key[0] === '$') {
      simpleTypes.push([types$1[key]._identify, key]);
      return;
    }

    var systemName = types$1[key]._systemName;
    typeMap[systemName] = key;

    if (systemName[0] === '_') {
      wrappedTypeMap[systemName.slice(1)] = systemName;
    }
  });
  var store = {
    _compat: options.compat,
    _encodeSymbolKeys: options.encodeSymbolKeys,
    _onFinish: options.onFinish,
    _simpleTypes: simpleTypes,
    _types: types$1,
    _typeMap: typeMap,
    _wrappedTypeMap: wrappedTypeMap,
    _references: genReferenceTracker(options.encodeSymbolKeys),
    // Known References
    _deferred: [],
    // Deferment List of dataItems to encode later, in callback form, such as blobs and files, which are non-synchronous by design
    _output: {}
  };
  var rootPointerKey = encounterItem(store, value);
  var resumeIndex = encodeAll(store); // Node does not support the deferred types

  /* istanbul ignore next */

  if (store._deferred.length > 0) {
    // Handle Blob or File type encoding
    if (typeof options.onFinish !== 'function') {
      if (store._compat) {
        // In compat mode, if the onFinish function is not provided, File and Blob object data will be discarded as empty and returns data immediately
        return prepOutput(store, rootPointerKey);
      }

      throw new Error('Deferred Types require onFinish option.');
    }

    var deferredLength = store._deferred.length;

    var onCallback = function onCallback() {
      deferredLength -= 1;

      if (deferredLength === 0) {
        encodeAll(store, resumeIndex);
        return prepOutput(store, rootPointerKey);
      }
    };

    store._deferred.forEach(function (dataItem) {
      types$1[dataItem._key]._deferredEncode(dataItem._reference, store._output[dataItem._key][dataItem._index], function (data) {
        return encounterItem(store, data);
      }, onCallback);
    });

    return;
  } // Normal output without deferment


  return prepOutput(store, rootPointerKey);
};

var fromBase = function fromBase(numberString, alphabet) {
  var radix = alphabet.length;
  return numberString.split('').reduce(function (character, index) {
    return character * radix + alphabet.indexOf(index);
  }, 0);
};

var decompressValues = function decompressValues(key, value, types) {
  // Unrecognized Types, Strings, and Symbols get no additional decompression
  if (!types[key] || types[key]._compressionType === 0) {
    return value;
  } // Join Numbers and BigInts using comma, strings need to stay in Array form


  if (types[key]._compressionType === 1) {
    return value.split(',');
  } // Split items into Pointer data sets, and split Pointer data sets into individual Pointers
  // Convert each pointer from Base string indices, and account for simple types having no index


  return value.split(',').map(function (valueItems) {
    return valueItems.split(' ').map(function (pointerCombinedString) {
      var parts = splitPointers(pointerCombinedString).slice(1);
      var pointers = [];

      for (var p = 0; p < parts.length; p += 2) {
        var _key = parts[p];
        pointers.push(_key + fromBase(parts[p + 1], alphabet));
      }

      return pointers;
    });
  });
}; // Recursively look at the reference set for exploration values
// This handles both pair arrays and individual values
// This recursion is fine because it has a maximum depth of around 3


var exploreParts = function exploreParts(store, parts) {
  if (getSystemName(parts) === 'Array') {
    parts.forEach(function (part) {
      exploreParts(store, part);
    });
  } else {
    store._explore.push(parts);
  }
};

var explorePointer = function explorePointer(store, pointer) {
  // If a simple pointer or an already explored pointer, ignore
  if (types$1[pointer] || store._decoded[pointer] !== void 0) {
    return;
  }

  var p = extractPointer(pointer); // Unknown pointer type

  if (!types$1[p._key]) {
    // In compat mode, ignore
    if (store._compat) {
      return;
    }

    throw new Error("Cannot decode unrecognized pointer type \"" + p._key + "\".");
  }

  store._decoded[pointer] = {
    _key: p._key,
    _index: p._index,
    _pointer: pointer,
    _reference: void 0,
    _parts: store._encoded[p._key][p._index]
  };

  try {
    store._decoded[pointer]._reference = types$1[p._key]._generateReference(store, store._encoded[p._key][p._index]);
  } catch (e) {
    if (!store._compat) {
      // This can happen if the data is malformed, or if the environment does not support the type the data has encoded
      throw new Error("Cannot decode recognized pointer type \"" + p._key + "\".");
    } // In compat mode, ignore

  }

  if (getSystemName(store._decoded[pointer]._parts) === 'Array') {
    exploreParts(store, store._decoded[pointer]._parts);
  }
};

var decode = function decode(encoded, options) {
  options = options || {};
  var parsed = JSON.parse(encoded);
  var formatted = parsed.slice(1).reduce(function (accumulator, e) {
    accumulator[e[0]] = decompressValues(e[0], e[1], types$1);
    return accumulator;
  }, {});
  var rootPointerKey = parsed[0].split(',')[0];
  var store = {
    _compat: options.compat,
    _types: types$1,
    _encoded: formatted,
    _decoded: {},
    _explore: []
  }; // Simple pointer, return value

  if (types$1[rootPointerKey]) {
    return types$1[rootPointerKey]._value;
  }

  var rootP = extractPointer(rootPointerKey); // Unrecognized root type

  if (!types$1[rootP._key]) {
    if (store._compat) {
      return rootPointerKey;
    }

    throw new Error("Cannot decode unrecognized pointer type \"" + rootP._key + "\".");
  } // Explore through data structure


  store._explore.push(rootPointerKey);

  while (store._explore.length) {
    explorePointer(store, store._explore.shift());
  } // Having explored all of the data structure, fill out data and references
  // IE11 and lower do not support Object.values


  Object.keys(store._decoded).forEach(function (key) {
    var dataItem = store._decoded[key];

    types$1[dataItem._key]._build(store, dataItem);
  });
  return store._decoded[rootPointerKey]._reference;
};
/* @license BSL-1.0 https://git.io/fpQEc */


var main = {
  encode: encode,
  decode: decode
};
module.exports = main;