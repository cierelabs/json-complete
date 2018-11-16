'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var getSystemName = function getSystemName(v) {
  return Object.prototype.toString.call(v).slice(8, -1);
};

var getAttachments = function getAttachments(v) {
  var attached = {
    _indices: [],
    _attachments: []
  }; // Find all indices

  var indices = [];
  var indexObj = {}; // Objects not based on Arrays, like Objects and Sets, will not find any indices here because we are using the Array.prototype.forEach

  Array.prototype.forEach.call(v, function (value, index) {
    indexObj[String(index)] = 1;
    indices.push(index);
  }); // Have to use external index iterator because we want the counting to stop once the first index incongruity occurs

  var i = 0; // Find all String keys that are not indices
  // For Arrays, TypedArrays, and Object-Wrapped Strings, the keys list will include indices as strings, so account for that by checking the indexObj

  var keys = Object.keys(v).filter(function (key) {
    return !indexObj[key];
  }).concat(Object.getOwnPropertySymbols(v).filter(function (symbol) {
    // Ignore built-in Symbols
    // If the Symbol ID that is part of the Symbol global is not equal to the tested Symbol, then it is NOT a built-in Symbol
    return Symbol[String(symbol).slice(14, -1)] !== symbol;
  })); // Create the lists

  return indices.concat(keys).reduce(function (accumulator, key) {
    if (key === i) {
      i += 1;

      accumulator._indices.push(v[key]);
    } else {
      accumulator._attachments.push([key, v[key]]);
    }

    return accumulator;
  }, attached);
};

var getPointerKey = function getPointerKey(store, item) {
  var pointerKey = Object.keys(store._types).find(function (typeKey) {
    return store._types[typeKey]._identify(item);
  });

  if (!pointerKey && !store._safe) {
    throw new Error("Cannot encode unsupported type \"".concat(getSystemName(item), "\"."));
  } // In safe mode, Unsupported types are stored as plain, empty objects, so that they retain their referencial integrity, but can still handle attachments


  return pointerKey ? pointerKey : 'ob';
};

var prepExplorableItem = function prepExplorableItem(store, item) {
  // Type is known type and is a reference type (not simple), it should be explored
  if ((store._types[getPointerKey(store, item)] || {})._build) {
    store._explore.push(item);
  }
};

var encounterItem = function encounterItem(store, item) {
  var pointerKey = getPointerKey(store, item); // Simple type, return pointer (pointer key)

  if (!store._types[pointerKey]._build) {
    return pointerKey;
  } // Already encountered, return pointer


  var existingDataItem = store._references.get(item);

  if (existingDataItem !== void 0) {
    return existingDataItem._pointer;
  } // Ensure location exists


  store._output[pointerKey] = store._output[pointerKey] || []; // Add temp value to update the location

  store._output[pointerKey].push(void 0);

  var pointerIndex = store._output[pointerKey].length - 1;
  var attached = getAttachments(item);
  var dataItem = {
    _key: pointerKey,
    _index: pointerIndex,
    _pointer: pointerKey + pointerIndex,
    _reference: item,
    // Save the known attachments for the next phase so we do not have to reacquire them
    // Strings and Object-wrapped Strings will include indices for each character in the string, so ignore them
    _indices: store._types[pointerKey]._ignoreIndices ? [] : attached._indices,
    _attachments: attached._attachments
  }; // Store the reference uniquely along with location information

  store._references.set(item, dataItem);
  /* istanbul ignore next */


  if (store._types[pointerKey]._deferredEncode) {
    store._deferred.push(dataItem);
  } // Prep sub-items to be explored later


  dataItem._indices.forEach(function (s) {
    prepExplorableItem(store, s);
  });

  dataItem._attachments.forEach(function (s) {
    prepExplorableItem(store, s[0]);
    prepExplorableItem(store, s[1]);
  });

  return dataItem._pointer;
};

var genSimpleEqualityType = function genSimpleEqualityType(value) {
  return {
    _identify: function _identify(v) {
      return v === value;
    },
    _value: value
  };
};

var undefinedType = genSimpleEqualityType(void 0);
var nullType = genSimpleEqualityType(null);
var NaNType = {
  _identify: function _identify(v) {
    return v !== v;
  },
  _value: NaN
};
var InfinityType = genSimpleEqualityType(Infinity);
var NegativeInfinityType = genSimpleEqualityType(-Infinity);
var Negative0Type = {
  _identify: function _identify(v) {
    return v === 0 && 1 / v === -Infinity;
  },
  _value: -0
};
var trueType = genSimpleEqualityType(true);
var falseType = genSimpleEqualityType(false);

var extractPointer = function extractPointer(pointer) {
  return {
    _key: pointer.slice(0, 2),
    _index: parseInt(pointer.slice(2), 10)
  };
}; // This is the function for getting pointer values in the generateReference functions


var decodePointer = function decodePointer(store, pointer) {
  if (store._types[pointer]) {
    return store._types[pointer]._value;
  }

  var p = extractPointer(pointer);
  return store._types[p._key]._generateReference(store, p._key, p._index);
};

var genPrimitive = function genPrimitive(systemName, type, encodeValue, generateReference) {
  return {
    _identify: function _identify(v) {
      return getSystemName(v) === systemName && !(v instanceof type);
    },
    _encodeValue: encodeValue,
    _generateReference: generateReference,
    _build: function _build() {}
  };
};

var NumberType = genPrimitive('Number', Number, function (store, dataItem) {
  return encounterItem(store, String(dataItem._reference));
}, function (store, key, index) {
  return parseFloat(decodePointer(store, store._encoded[key][index]));
});
var StringType = Object.assign({
  // Strings allow index access into the string value, which is already stored, so ignore indices
  _ignoreIndices: 1
}, genPrimitive('String', String, function (store, dataItem) {
  return dataItem._reference;
}, function (store, key, index) {
  return store._encoded[key][index];
}));

var genDoesMatchSystemName = function genDoesMatchSystemName(systemName) {
  return function (v) {
    return getSystemName(v) === systemName;
  };
};

var tryCreateType = function tryCreateType(typeOf, typeCreator) {
  return typeOf === 'function' ? typeCreator() : {
    _identify: function _identify() {}
  };
};

var SymbolType = tryCreateType(typeof Symbol === "undefined" ? "undefined" : _typeof(Symbol), function () {
  return {
    _identify: genDoesMatchSystemName('Symbol'),
    _encodeValue: function _encodeValue(store, dataItem) {
      var symbolStringKey = Symbol.keyFor(dataItem._reference);
      var isRegistered = symbolStringKey !== void 0;
      return [// For Registered Symbols, specify with true value and store the registered string value
      // For unique Symbols, specify with false value and also store the optional identifying string
      encounterItem(store, isRegistered ? true : false), encounterItem(store, isRegistered ? symbolStringKey : String(dataItem._reference).slice(7, -1))];
    },
    _generateReference: function _generateReference(store, key, index) {
      var encodedValue = store._encoded[key][index];
      var identifierString = decodePointer(store, encodedValue[1]);
      return decodePointer(store, encodedValue[0]) ? Symbol.for(identifierString) : Symbol(identifierString);
    },
    _build: function _build() {} // Symbols doesn't allow attachments, no-op

  };
});

var arrayLikeEncodeValue = function arrayLikeEncodeValue(store, dataItem) {
  return [dataItem._indices.map(function (subValue) {
    return encounterItem(store, subValue);
  })];
}; // This is the function for getting pointer references in the build functions


var getDecoded = function getDecoded(store, pointer) {
  if (store._types[pointer]) {
    return store._types[pointer]._value;
  }

  var p = extractPointer(pointer);

  if (store._types[p._key]) {
    return store._decoded[pointer]._reference;
  }

  if (store._safe) {
    return pointer;
  }

  throw new Error("Cannot decode unrecognized pointer type \"".concat(p._key, "\"."));
};

var attachAttachments = function attachAttachments(store, dataItem, attachments) {
  attachments.forEach(function (pair) {
    dataItem._reference[getDecoded(store, pair[0])] = getDecoded(store, pair[1]);
  });
};

var attachAttachmentsSkipFirst = function attachAttachmentsSkipFirst(store, dataItem) {
  attachAttachments(store, dataItem, dataItem._parts.slice(1));
};

var genArrayLike = function genArrayLike(systemName, generateReference) {
  return {
    _identify: genDoesMatchSystemName(systemName),
    _encodeValue: arrayLikeEncodeValue,
    _generateReference: generateReference,
    _build: function _build(store, dataItem) {
      dataItem._parts[0].forEach(function (pointer, index) {
        dataItem._reference[index] = getDecoded(store, pointer);
      });

      attachAttachmentsSkipFirst(store, dataItem);
    }
  };
};

var ArrayType = genArrayLike('Array', function () {
  return [];
});
var ArgumentsType = genArrayLike('Arguments', function (store, key, index) {
  return function () {
    return arguments;
  }.apply(null, Array(store._encoded[key][index][0].length));
});
var ObjectType = {
  _identify: genDoesMatchSystemName('Object'),
  _encodeValue: function _encodeValue() {
    return [];
  },
  _generateReference: function _generateReference() {
    return {};
  },
  _build: function _build(store, dataItem) {
    attachAttachments(store, dataItem, dataItem._parts);
  }
};

var genPrimitiveObject = function genPrimitiveObject(systemName, type) {
  return {
    _identify: function _identify(v) {
      return getSystemName(v) === systemName && v instanceof type;
    },
    _encodeValue: function _encodeValue(store, dataItem) {
      return [encounterItem(store, dataItem._reference.valueOf())];
    },
    _generateReference: function _generateReference(store, key, index) {
      return new type(decodePointer(store, store._encoded[key][index][0]));
    },
    _build: attachAttachmentsSkipFirst
  };
};

var BooleanObjectType = genPrimitiveObject('Boolean', Boolean);
var NumberObjectType = genPrimitiveObject('Number', Number);
var StringObjectType = Object.assign({
  // String Objects allow index access into the string value, which is already stored, so ignore indices
  _ignoreIndices: 1
}, genPrimitiveObject('String', String));
var DateType = genPrimitiveObject('Date', Date);

var genAttachableValueObject = function genAttachableValueObject(systemName, encodeValue, generateReference) {
  return {
    _identify: genDoesMatchSystemName(systemName),
    _encodeValue: encodeValue,
    _generateReference: generateReference,
    _build: attachAttachmentsSkipFirst
  };
};

var RegExpType = genAttachableValueObject('RegExp', function (store, dataItem) {
  return [[encounterItem(store, dataItem._reference.source), encounterItem(store, dataItem._reference.flags), encounterItem(store, dataItem._reference.lastIndex)]];
}, function (store, key, index) {
  var dataArray = store._encoded[key][index][0];
  var value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
  value.lastIndex = decodePointer(store, dataArray[2]);
  return value;
});
var standardErrors = {
  'EvalError': EvalError,
  'RangeError': RangeError,
  'ReferenceError': ReferenceError,
  'SyntaxError': SyntaxError,
  'TypeError': TypeError,
  'URIError': URIError
};
var ErrorType = genAttachableValueObject('Error', function (store, dataItem) {
  return [[encounterItem(store, standardErrors[dataItem._reference.name] ? dataItem._reference.name : 'Error'), encounterItem(store, dataItem._reference.message), encounterItem(store, dataItem._reference.stack)]];
}, function (store, key, index) {
  var dataArray = store._encoded[key][index][0];
  var value = new (standardErrors[decodePointer(store, dataArray[0])] || Error)(decodePointer(store, dataArray[1]));
  value.stack = decodePointer(store, dataArray[2]);
  return value;
});

var genArrayBuffer = function genArrayBuffer(systemName, type) {
  return {
    _identify: genDoesMatchSystemName(systemName),
    _encodeValue: function _encodeValue(store, dataItem) {
      dataItem._indices = Array.from(new Uint8Array(dataItem._reference));
      return arrayLikeEncodeValue(store, dataItem);
    },
    _generateReference: function _generateReference(store, key, index) {
      var encodedValues = store._encoded[key][index][0];
      var buffer = new type(encodedValues.length);
      var view = new Uint8Array(buffer);
      encodedValues.forEach(function (pointer, index) {
        view[index] = decodePointer(store, pointer);
      });
      return buffer;
    },
    _build: attachAttachmentsSkipFirst
  };
};

var ArrayBufferType = tryCreateType(typeof ArrayBuffer === "undefined" ? "undefined" : _typeof(ArrayBuffer), function () {
  return genArrayBuffer('ArrayBuffer', ArrayBuffer);
});
var SharedArrayBufferType = tryCreateType(typeof SharedArrayBuffer === "undefined" ? "undefined" : _typeof(SharedArrayBuffer), function () {
  return genArrayBuffer('SharedArrayBuffer', SharedArrayBuffer);
});

var genTypedArray = function genTypedArray(systemName, type) {
  return genArrayLike(systemName, function (store, key, index) {
    return new type(store._encoded[key][index][0].length);
  });
};

var Int8ArrayType = tryCreateType(typeof Int8Array === "undefined" ? "undefined" : _typeof(Int8Array), function () {
  return genTypedArray('Int8Array', Int8Array);
});
var Uint8ArrayType = tryCreateType(typeof Uint8Array === "undefined" ? "undefined" : _typeof(Uint8Array), function () {
  return genTypedArray('Uint8Array', Uint8Array);
});
var Uint8ClampedArrayType = tryCreateType(typeof Uint8ClampedArray === "undefined" ? "undefined" : _typeof(Uint8ClampedArray), function () {
  return genTypedArray('Uint8ClampedArray', Uint8ClampedArray);
});
var Int16ArrayType = tryCreateType(typeof Int16Array === "undefined" ? "undefined" : _typeof(Int16Array), function () {
  return genTypedArray('Int16Array', Int16Array);
});
var Uint16ArrayType = tryCreateType(typeof Uint16Array === "undefined" ? "undefined" : _typeof(Uint16Array), function () {
  return genTypedArray('Uint16Array', Uint16Array);
});
var Int32ArrayType = tryCreateType(typeof Int32Array === "undefined" ? "undefined" : _typeof(Int32Array), function () {
  return genTypedArray('Int32Array', Int32Array);
});
var Uint32ArrayType = tryCreateType(typeof Uint32Array === "undefined" ? "undefined" : _typeof(Uint32Array), function () {
  return genTypedArray('Uint32Array', Uint32Array);
});
var Float32ArrayType = tryCreateType(typeof Float32Array === "undefined" ? "undefined" : _typeof(Float32Array), function () {
  return genTypedArray('Float32Array', Float32Array);
});
var Float64ArrayType = tryCreateType(typeof Float64Array === "undefined" ? "undefined" : _typeof(Float64Array), function () {
  return genTypedArray('Float64Array', Float64Array);
});

var genSetLike = function genSetLike(systemName, type, encodeSubValue, buildSubPointers) {
  return {
    _identify: genDoesMatchSystemName(systemName),
    _encodeValue: function _encodeValue(store, dataItem) {
      return [Array.from(dataItem._reference).map(function (subValue) {
        return encodeSubValue(store, subValue);
      })];
    },
    _generateReference: function _generateReference() {
      return new type();
    },
    _build: function _build(store, dataItem) {
      dataItem._parts[0].forEach(function (subPointers) {
        buildSubPointers(store, dataItem._reference, subPointers);
      });

      attachAttachmentsSkipFirst(store, dataItem);
    }
  };
};

var SetType = tryCreateType(typeof Set === "undefined" ? "undefined" : _typeof(Set), function () {
  return genSetLike('Set', Set, function (store, subValue) {
    return encounterItem(store, subValue);
  }, function (store, addTo, subPointer) {
    addTo.add(getDecoded(store, subPointer));
  });
});
var MapType = tryCreateType(typeof Map === "undefined" ? "undefined" : _typeof(Map), function () {
  return genSetLike('Map', Map, function (store, subValue) {
    return [encounterItem(store, subValue[0]), encounterItem(store, subValue[1])];
  }, function (store, addTo, subPointers) {
    addTo.set(getDecoded(store, subPointers[0]), getDecoded(store, subPointers[1]));
  });
});
/* istanbul ignore next */

var genBlobLike = function genBlobLike(systemName, propertiesKeys, create) {
  return {
    _identify: genDoesMatchSystemName(systemName),
    _encodeValue: function _encodeValue(store, dataItem) {
      return [[new Uint8Array(0)].concat(propertiesKeys.map(function (property) {
        return encounterItem(store, dataItem._reference[property]);
      }))];
    },
    _deferredEncode: function _deferredEncode(store, dataItem, callback) {
      var reader = new FileReader();
      reader.addEventListener('loadend', function () {
        var typedArray = new Uint8Array(reader.result); // Set the typed array pointer into the output

        var typedArrayPointer = encounterItem(store, typedArray);
        store._output[dataItem._key][dataItem._index][0][0] = typedArrayPointer; // Create new number array here inside an array as if we are exploring it normally

        var typedArrayP = extractPointer(typedArrayPointer);
        store._output[typedArrayP._key][typedArrayP._index] = [Array.from(typedArray).map(function (subItem) {
          var numberPointer = encounterItem(store, subItem);
          var numberP = extractPointer(numberPointer); // Last step: Since numbers are converted to strings, we have to add them as strings as well and store the pointer to the string in the number index

          var stringLength = store._output.st.length;
          store._output.st[stringLength] = String(subItem);
          store._output[numberP._key][numberP._index] = "st".concat(stringLength);
          return numberPointer;
        })];
        callback();
      });
      reader.readAsArrayBuffer(dataItem._reference);
    },
    _generateReference: function _generateReference(store, key, index) {
      var dataArray = store._encoded[key][index][0];
      var p = extractPointer(dataArray[0]);
      return create(store, [new Uint8Array(store._encoded[p._key][p._index][0].map(function (pointer) {
        return decodePointer(store, pointer);
      }))], dataArray);
    },
    _build: attachAttachmentsSkipFirst
  };
};
/* istanbul ignore next */


var BlobType = tryCreateType(typeof Blob === "undefined" ? "undefined" : _typeof(Blob), function () {
  return genBlobLike('Blob', ['type'], function (store, buffer, dataArray) {
    return new Blob(buffer, {
      type: decodePointer(store, dataArray[1])
    });
  });
});
/* istanbul ignore next */

var FileType = tryCreateType(typeof File === "undefined" ? "undefined" : _typeof(File), function () {
  return genBlobLike('File', ['name', 'type', 'lastModified'], function (store, buffer, dataArray) {
    return new File(buffer, decodePointer(store, dataArray[1]), {
      type: decodePointer(store, dataArray[2]),
      lastModified: decodePointer(store, dataArray[3])
    });
  });
});
/* istanbul ignore next */

var BigIntType = tryCreateType(typeof BigInt === "undefined" ? "undefined" : _typeof(BigInt), function () {
  return genPrimitive('BigInt', BigInt, function (store, dataItem) {
    return encounterItem(store, String(dataItem._reference));
  }, function (store, key, index) {
    return BigInt(decodePointer(store, store._encoded[key][index]));
  });
});
var types = {
  un: undefinedType,
  nl: nullType,
  na: NaNType,
  pI: InfinityType,
  nI: NegativeInfinityType,
  n0: Negative0Type,
  bt: trueType,
  bf: falseType,
  nm: NumberType,
  // ORDER MATTERS: General Number must come after special numbers NaN, -0, Infinity, and -Infinity
  st: StringType,
  sy: SymbolType,
  ar: ArrayType,
  ag: ArgumentsType,
  ob: ObjectType,
  BO: BooleanObjectType,
  NM: NumberObjectType,
  ST: StringObjectType,
  da: DateType,
  re: RegExpType,
  er: ErrorType,
  AB: ArrayBufferType,
  SA: SharedArrayBufferType,
  I1: Int8ArrayType,
  U1: Uint8ArrayType,
  C1: Uint8ClampedArrayType,
  I2: Int16ArrayType,
  U2: Uint16ArrayType,
  I3: Int32ArrayType,
  U3: Uint32ArrayType,
  F3: Float32ArrayType,
  F4: Float64ArrayType,
  Se: SetType,
  Ma: MapType,
  Bl: BlobType,
  Fi: FileType,
  BI: BigIntType
};

var prepOutput = function prepOutput(store, root) {
  store._output.r = root;
  store._output.v = '1.0.0'; // Convert the output object form to an output array form

  var output = Object.keys(store._output).map(function (key) {
    return [key, store._output[key]];
  });

  if (typeof store._onFinish === 'function') {
    store._onFinish(output);
  } else {
    return output;
  }
};

var encode = function encode(value, options) {
  options = options || {};
  var store = {
    _safe: options.safeMode,
    _onFinish: options.onFinish,
    _types: types,
    _references: new Map(),
    // Known References
    _explore: [],
    // Exploration queue
    _deferred: [],
    // Deferment List of dataItems to encode later, in callback form, such as blobs and files, which are non-synchronous by design
    _output: {}
  };
  var rootPointerKey = encounterItem(store, value); // Root value is simple, can skip main encoding steps

  if (types[rootPointerKey]) {
    return prepOutput(store, rootPointerKey);
  } // Explore through the data structure


  store._explore.push(value);

  while (store._explore.length) {
    encounterItem(store, store._explore.shift());
  } // Having found all data structure contents, encode each value into the encoded output


  store._references.forEach(function (dataItem) {
    // Encode the actual value
    store._output[dataItem._key][dataItem._index] = types[dataItem._key]._encodeValue(store, dataItem); // Encode any values attached to the value

    if (dataItem._attachments.length > 0) {
      store._output[dataItem._key][dataItem._index] = store._output[dataItem._key][dataItem._index].concat(dataItem._attachments.map(function (attachment) {
        return [encounterItem(store, attachment[0]), encounterItem(store, attachment[1])];
      }));
    }
  });
  /* istanbul ignore next */


  if (store._deferred.length > 0) {
    // Handle Blob or File type encoding
    if (typeof options.onFinish !== 'function') {
      if (store._safe) {
        // In safe mode, if the onFinish function is not provided, File and Blob object data will be discarded as empty and returns data immediately
        return prepOutput(store, rootPointerKey);
      }

      throw new Error('Found deferred type, but no onFinish option provided.');
    }

    var deferredLength = store._deferred.length;

    var onCallback = function onCallback() {
      deferredLength -= 1;

      if (deferredLength === 0) {
        return prepOutput(store, rootPointerKey);
      }
    };

    store._deferred.forEach(function (dataItem) {
      types[dataItem._key]._deferredEncode(store, dataItem, onCallback);
    });

    return;
  } // Normal output without deferment


  return prepOutput(store, rootPointerKey);
}; // Recursively look at the reference set for exploration values
// This handles both pair arrays and individual values
// This recursion is fine because it has a maximum depth of 3


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
  var p = extractPointer(pointer); // If a simple pointer, an unknown pointer, or an already explored pointer, ignore

  if (types[pointer] || !types[p._key] || store._decoded[pointer] !== void 0) {
    return;
  }

  store._decoded[pointer] = {
    _key: p._key,
    _index: p._index,
    _pointer: pointer,
    _reference: void 0,
    _parts: store._encoded[p._key][p._index]
  };
  store._decoded[pointer]._reference = types[p._key]._generateReference(store, p._key, p._index);

  if (getSystemName(store._decoded[pointer]._parts) === 'Array') {
    exploreParts(store, store._decoded[pointer]._parts);
  }
};

var decode = function decode(encoded, options) {
  options = options || {};
  var store = {
    _safe: options.safeMode,
    _types: types,
    _encoded: encoded.reduce(function (accumulator, e) {
      accumulator[e[0]] = e[1];
      return accumulator;
    }, {}),
    _decoded: {},
    _explore: []
  };
  var rootPointerKey = store._encoded.r; // Simple pointer, return value

  if (types[rootPointerKey]) {
    return types[rootPointerKey]._value;
  }

  var rootP = extractPointer(rootPointerKey); // Unrecognized root type

  if (!types[rootP._key]) {
    if (store._safe) {
      return rootPointerKey;
    }

    throw new Error("Cannot decode unrecognized pointer type \"".concat(rootP._key, "\"."));
  } // Explore through data structure


  store._explore.push(rootPointerKey);

  while (store._explore.length) {
    explorePointer(store, store._explore.shift());
  } // Having explored all of the data structure, fill out data and references


  Object.values(store._decoded).forEach(function (dataItem) {
    types[dataItem._key]._build(store, dataItem);
  });
  return store._decoded[rootPointerKey]._reference;
};

var main = {
  encode: encode,
  decode: decode
};
module.exports = main;