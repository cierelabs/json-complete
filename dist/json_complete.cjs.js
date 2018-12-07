'use strict';

var getSystemName = function getSystemName(v) {
  return Object.prototype.toString.call(v).slice(8, -1);
};

var findItemKey = function findItemKey(store, item) {
  if (item === void 0) {
    return 'un';
  }

  if (item === null) {
    return 'nl';
  }

  if (item === true) {
    return 'tr';
  }

  if (item === false) {
    return 'fa';
  }

  if (typeof item === 'number') {
    if (item === Infinity) {
      return 'pI';
    }

    if (item === -Infinity) {
      return 'nI';
    }

    if (item !== item) {
      return 'Na';
    }

    if (item === 0 && 1 / item === -Infinity) {
      return 'n0';
    }
  }

  var systemName = getSystemName(item);
  var wrappedTypeSystemName = store._wrappedTypeMap[systemName];

  if (wrappedTypeSystemName && typeof item === 'object') {
    systemName = wrappedTypeSystemName;
  }

  return store._typeMap[systemName];
};

var genError = function genError(message, operation, type) {
  var error = new Error(message);
  error.operation = operation;
  error.type = type;
  return error;
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

  if (encodeSymbolKeys) {
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
};

var extractPointer = function extractPointer(pointer) {
  return {
    _key: pointer.slice(0, 2),
    _index: Number(pointer.slice(2))
  };
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

var attachKeys = function attachKeys(store, dataItem, keyIndex, valueIndex) {
  for (var i = 0; i < (dataItem._parts[keyIndex] || []).length; i += 1) {
    dataItem._reference[getDecoded(store, dataItem._parts[keyIndex][i])] = getDecoded(store, dataItem._parts[valueIndex][i]);
  }
};

var attachKeysStandard = function attachKeysStandard(store, dataItem) {
  attachKeys(store, dataItem, 1, 2);
};

var attachIndices = function attachIndices(store, dataItem) {
  for (var i = 0; i < dataItem._parts[0].length; i += 1) {
    dataItem._reference[i] = getDecoded(store, dataItem._parts[0][i]);
  }
};

var arrayLikeBuild = function arrayLikeBuild(store, dataItem) {
  attachIndices(store, dataItem);
  attachKeysStandard(store, dataItem);
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
    _build: arrayLikeBuild
  };
};

var ArrayBufferTypes = function ArrayBufferTypes(typeObj) {
  /* istanbul ignore else */
  if (typeof ArrayBuffer === 'function') {
    typeObj.AB = genArrayBuffer(ArrayBuffer);
  } // Support does not exist or was removed from most environments due to Spectre and Meltdown vulnerabilities
  // https://caniuse.com/#feat=sharedarraybuffer

  /* istanbul ignore else */


  if (typeof SharedArrayBuffer === 'function') {
    typeObj.Sh = genArrayBuffer(SharedArrayBuffer);
  }

  return typeObj;
};

var arrayLikeEncodeValue = function arrayLikeEncodeValue(reference, attachments) {
  return encodeWithAttachments([attachments._indices], attachments);
};

var ArrayLikeTypes = function ArrayLikeTypes(typeObj) {
  typeObj.Ar = {
    _systemName: 'Array',
    _encodeValue: arrayLikeEncodeValue,
    _generateReference: function _generateReference() {
      return [];
    },
    _build: arrayLikeBuild
  };
  typeObj.rg = {
    _systemName: 'Arguments',
    _encodeValue: arrayLikeEncodeValue,
    _generateReference: function _generateReference(store, dataItems) {
      return function () {
        return arguments;
      }.apply(null, Array(dataItems[0].length));
    },
    _build: arrayLikeBuild
  };
  return typeObj;
};

var genPrimitive = function genPrimitive(type) {
  return {
    _systemName: getSystemName(type('')),
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
  typeObj.St = genPrimitive(String);
  typeObj.Nu = genPrimitive(Number);
  return typeObj;
};

var BigIntType = function BigIntType(typeObj) {
  /* istanbul ignore if */
  if (typeof BigInt === 'function') {
    typeObj.Bi = genPrimitive(BigInt);
  }

  return typeObj;
};
/* istanbul ignore next */


var genBlobLike = function genBlobLike(systemName, propertiesKeys, create) {
  return {
    _systemName: systemName,
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
      var p = extractPointer(dataItems[0][0]);
      return create(store, [new Uint8Array(store._encoded[p._key][p._index][0].map(function (pointer) {
        return decodePointer(store, pointer);
      }))], dataItems[0]);
    },
    _build: attachKeysStandard
  };
};

var BlobTypes = function BlobTypes(typeObj) {
  // Supported back to IE10

  /* istanbul ignore if */
  if (typeof Blob === 'function') {
    typeObj.Bl = genBlobLike('Blob', ['type'], function (store, buffer, dataArray) {
      return new Blob(buffer, {
        type: decodePointer(store, dataArray[1])
      });
    });
  } // Supported back to IE10, but IE10, IE11, and (so far) Edge do not support the File constructor

  /* istanbul ignore if */


  if (typeof File === 'function') {
    typeObj.Fi = genBlobLike('File', ['type', 'name', 'lastModified'], function (store, buffer, dataArray) {
      try {
        return new File(buffer, decodePointer(store, dataArray[2]), {
          type: decodePointer(store, dataArray[1]),
          lastModified: decodePointer(store, dataArray[3])
        });
      } catch (e) {
        // IE10, IE11, and Edge does not support the File constructor
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
  typeObj.Da = {
    _systemName: 'Date',
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([reference.valueOf()], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      return new Date(decodePointer(store, dataItems[0]));
    },
    _build: attachKeysStandard
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
  typeObj.Er = {
    _systemName: 'Error',
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([[standardErrors[reference.name] ? reference.name : 'Error', reference.message, reference.stack]], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      var dataArray = dataItems[0];
      var value = new (standardErrors[decodePointer(store, dataArray[0])] || Error)(decodePointer(store, dataArray[1]));
      value.stack = decodePointer(store, dataArray[2]);
      return value;
    },
    _build: attachKeysStandard
  };
  return typeObj;
};

var KeyedCollectionTypes = function KeyedCollectionTypes(typeObj) {
  // If Set is supported, Map is also supported

  /* istanbul ignore else */
  if (typeof Set === 'function') {
    typeObj.Se = {
      _systemName: 'Set',
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

        attachKeysStandard(store, dataItem);
      }
    };
    typeObj.Ma = {
      _systemName: 'Map',
      _deepValue: 1,
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
  typeObj.Ob = {
    _systemName: 'Object',
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

var getFlags = function getFlags(reference) {
  /* istanbul ignore if */
  if (reference.flags === void 0) {
    // Edge and IE use `options` parameter instead of `flags`, regardless of what it says on MDN
    return reference.options;
  }

  return reference.flags;
};

var RegExpType = function RegExpType(typeObj) {
  typeObj.Re = {
    _systemName: 'RegExp',
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([[reference.source, getFlags(reference), reference.lastIndex]], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      var dataArray = dataItems[0];
      var value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
      value.lastIndex = decodePointer(store, dataArray[2]);
      return value;
    },
    _build: attachKeysStandard
  };
  return typeObj;
};

var SimpleTypes = function SimpleTypes(typeObj) {
  typeObj.un = {
    _value: void 0
  };
  typeObj.nl = {
    _value: null
  };
  typeObj.tr = {
    _value: true
  };
  typeObj.fa = {
    _value: false
  };
  typeObj.pI = {
    _value: Infinity
  };
  typeObj.nI = {
    _value: -Infinity
  };
  typeObj.Na = {
    _value: NaN
  };
  typeObj.n0 = {
    _value: -0
  };
  return typeObj;
};

var SymbolType = function SymbolType(typeObj) {
  /* istanbul ignore else */
  if (typeof Symbol === 'function') {
    typeObj.Sy = {
      _systemName: 'Symbol',
      _encodeValue: function _encodeValue(reference) {
        var symbolStringKey = Symbol.keyFor(reference);
        var isRegistered = symbolStringKey !== void 0;
        return isRegistered ? "R" + symbolStringKey : " " + String(reference).slice(7, -1);
      },
      _generateReference: function _generateReference(store, decodedString) {
        return decodedString[0] === 'R' ? Symbol.for(decodedString.slice(1)) : Symbol(decodedString.slice(1));
      },
      _build: function _build() {} // Symbols do not allow attachments, no-op

    };
  }

  return typeObj;
};

var genTypedArray = function genTypedArray(type) {
  return {
    _systemName: getSystemName(new type()),
    _encodeValue: arrayLikeEncodeValue,
    _generateReference: function _generateReference(store, dataItems) {
      return new type(dataItems[0].length);
    },
    _build: arrayLikeBuild
  };
};

var TypedArrayTypes = function TypedArrayTypes(typeObj) {
  // If an environment supports Int8Array, it will support most of the TypedArray types

  /* istanbul ignore else */
  if (typeof Int8Array === 'function') {
    typeObj.I1 = genTypedArray(Int8Array);
    typeObj.I2 = genTypedArray(Int16Array);
    typeObj.I3 = genTypedArray(Int32Array);
    typeObj.U1 = genTypedArray(Uint8Array);
    typeObj.U2 = genTypedArray(Uint16Array);
    typeObj.U3 = genTypedArray(Uint32Array);
    typeObj.F3 = genTypedArray(Float32Array);
  } // IE10 and IE Mobile do not support Uint8ClampedArray
  // https://caniuse.com/#feat=typedarrays

  /* istanbul ignore else */


  if (typeof Uint8ClampedArray === 'function') {
    typeObj.C1 = genTypedArray(Uint8ClampedArray);
  } // Safari versions prior to 5.1 might not support the Float64ArrayType, even as they support other TypeArray types
  // https://caniuse.com/#feat=typedarrays

  /* istanbul ignore else */


  if (typeof Float64Array === 'function') {
    typeObj.F4 = genTypedArray(Float64Array);
  }

  return typeObj;
};

var genWrappedPrimitive = function genWrappedPrimitive(type) {
  return {
    // Prefix of _ is used to differenciate the Wrapped Primitive vs the Primitive Type
    _systemName: "_" + getSystemName(new type('')),
    _encodeValue: function _encodeValue(reference, attachments) {
      return encodeWithAttachments([reference.valueOf()], attachments);
    },
    _generateReference: function _generateReference(store, dataItems) {
      return new type(decodePointer(store, dataItems[0]));
    },
    _build: attachKeysStandard
  };
};

var WrappedPrimitiveTypes = function WrappedPrimitiveTypes(typeObj) {
  typeObj.Bo = genWrappedPrimitive(Boolean);
  typeObj.NU = genWrappedPrimitive(Number);
  typeObj.ST = genWrappedPrimitive(String);
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
  var pointerKey = findItemKey(store, item);

  if (!pointerKey && !store._compat) {
    var type = getSystemName(item);
    throw genError("Cannot encode unsupported type \"" + type + "\".", 'encode', type);
  } // In compat mode, Unsupported types are stored as plain, empty objects, so that they retain their referencial integrity, but can still handle attachments


  return pointerKey ? pointerKey : 'Ob';
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
    var encodedForm = types$1[dataItem._key]._encodeValue(dataItem._reference, getAttachments(dataItem._reference, store._encodeSymbolKeys)); // All types that encode directly to Strings (String, Number, BigInt, and Symbol) do not have attachments


    if (getSystemName(encodedForm) !== 'String') {
      // Encounter all data in the encoded form to get the appropriate Pointers and
      encodedForm = encodedForm.map(function (part) {
        if (getSystemName(part) === 'Array') {
          return part.map(function (subPart) {
            return encounterItem(store, subPart);
          });
        } // Wrapped Primitive Types have a single value for the first item, rather than an Array


        return encounterItem(store, part);
      });
    }

    store._output[dataItem._key][dataItem._index] = encodedForm;
  }, resumeFromIndex);
};

var prepOutput = function prepOutput(store, root) {
  store._output.r = root;
  store._output.v = '1.0.0'; // Convert the output object form to an output array form

  var output = JSON.stringify(Object.keys(store._output).map(function (key) {
    return [key, store._output[key]];
  }), null, store._space);

  if (typeof store._onFinish === 'function') {
    store._onFinish(output);
  } else {
    return output;
  }
};

var encode = function encode(value, options) {
  options = options || {};
  var typeMap = {};
  var wrappedTypeMap = {};
  Object.keys(types$1).forEach(function (key) {
    var systemName = types$1[key]._systemName;

    if (systemName) {
      typeMap[systemName] = key;
    }

    if ((systemName || '')[0] === '_') {
      wrappedTypeMap[systemName.slice(1)] = systemName;
    }
  });
  var store = {
    _compat: options.compat,
    _encodeSymbolKeys: options.encodeSymbolKeys,
    _onFinish: options.onFinish,
    _space: options.space,
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

      throw genError('Deferred Types require onFinish option.', 'encode');
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

var exploreParts = function exploreParts(store, parts) {
  if (getSystemName(parts) === 'Array') {
    parts.forEach(function (part) {
      store._explore.push(part);
    });
  } else {
    store._explore.push(parts);
  }
};

var explorePointer = function explorePointer(store, pointer) {
  var p = extractPointer(pointer); // Unknown pointer type

  if (!types$1[p._key]) {
    // In compat mode, ignore
    if (store._compat) {
      return;
    }

    throw genError("Cannot decode unrecognized pointer type \"" + p._key + "\".", 'decode', p._key);
  } // If a simple pointer or an already explored pointer, ignore


  if (types$1[pointer] || store._decoded[pointer] !== void 0) {
    return;
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
    // This can happen if the data is malformed, or if the environment does not support the type the data has encoded
    throw genError("Cannot decode recognized pointer type \"" + p._key + "\".", 'decode');
  }

  if (getSystemName(store._decoded[pointer]._parts) === 'Array') {
    exploreParts(store, store._decoded[pointer]._parts);
  }
};

var decode = function decode(encoded, options) {
  options = options || {};
  var store = {
    _compat: options.compat,
    _types: types$1,
    _encoded: JSON.parse(encoded).reduce(function (accumulator, e) {
      accumulator[e[0]] = e[1];
      return accumulator;
    }, {}),
    _decoded: {},
    _explore: []
  };
  var rootPointerKey = store._encoded.r; // Simple pointer, return value

  if (types$1[rootPointerKey]) {
    return types$1[rootPointerKey]._value;
  }

  var rootP = extractPointer(rootPointerKey); // Unrecognized root type

  if (!types$1[rootP._key]) {
    if (store._compat) {
      return rootPointerKey;
    }

    throw genError("Cannot decode unrecognized pointer type \"" + rootP._key + "\".", 'decode', rootP._key);
  } // Explore through data structure


  store._explore.push(rootPointerKey);

  while (store._explore.length) {
    explorePointer(store, store._explore.shift());
  } // Having explored all of the data structure, fill out data and references


  Object.values(store._decoded).forEach(function (dataItem) {
    types$1[dataItem._key]._build(store, dataItem);
  });
  return store._decoded[rootPointerKey]._reference;
};

var main = {
  encode: encode,
  decode: decode
};
module.exports = main;