"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define('json-complete', factory) : global['json-complete'] = factory();
})(void 0, function () {
  'use strict';

  var getAttachments = function getAttachments(v) {
    var attached = {
      indices: [],
      attachments: []
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
      var symbolStringMatches = String(symbol).match(/^Symbol\(Symbol\.([^\)]*)\)$/);
      return symbolStringMatches === null || symbolStringMatches.length !== 2 || Symbol[symbolStringMatches[1]] !== symbol;
    })); // Create the lists

    return indices.concat(keys).reduce(function (accumulator, key) {
      if (key === i) {
        i += 1;
        accumulator.indices.push(v[key]);
      } else {
        accumulator.attachments.push([key, v[key]]);
      }

      return accumulator;
    }, attached);
  };

  var extractPointer = function extractPointer(pointer) {
    return {
      key: pointer.substring(0, 2),
      index: parseInt(pointer.substring(2), 10)
    };
  };

  var isSimple = function isSimple(pointerKey) {
    return types[pointerKey] && !types[pointerKey].encodeValue;
  };

  var standardErrors = {
    'EvalError': EvalError,
    'RangeError': RangeError,
    'ReferenceError': ReferenceError,
    'SyntaxError': SyntaxError,
    'TypeError': TypeError,
    'URIError': URIError
  };

  var getDataItemValue = function getDataItemValue(store, dataItem) {
    return dataItem.value;
  };

  var arrayLikeEncodeValue = function arrayLikeEncodeValue(store, dataItem) {
    return [dataItem.indices.map(function (subValue) {
      return encounterItem(store, subValue);
    })];
  };

  var arrayBufferEncodeValue = function arrayBufferEncodeValue(store, dataItem) {
    dataItem.indices = Array.from(new Uint8Array(dataItem.value));
    return arrayLikeEncodeValue(store, dataItem);
  };

  var arrayLikeBuild = function arrayLikeBuild(store, dataItem) {
    dataItem.parts[0].forEach(function (pointer, index) {
      dataItem.value[index] = getDecoded(store, pointer);
    });
    attachAttachmentsSkipFirst(store, dataItem);
  };

  var objectWrappedEncodeValue = function objectWrappedEncodeValue(store, dataItem) {
    return [encounterItem(store, dataItem.value.valueOf())];
  };

  var attachAttachments = function attachAttachments(store, dataItem, attachments) {
    attachments.forEach(function (pair) {
      dataItem.value[getDecoded(store, pair[0])] = getDecoded(store, pair[1]);
    });
  };

  var attachAttachmentsSkipFirst = function attachAttachmentsSkipFirst(store, dataItem) {
    attachAttachments(store, dataItem, dataItem.parts.slice(1));
  }; // This is the function for getting pointer values in the generateReference functions


  var decodePointer = function decodePointer(store, pointer) {
    if (isSimple(pointer)) {
      return types[pointer].build();
    }

    var p = extractPointer(pointer);
    return types[p.key].generateReference(store, p.key, p.index);
  }; // This is the function for getting pointer references in the build functions


  var getDecoded = function getDecoded(store, pointer) {
    if (isSimple(pointer)) {
      return types[pointer].build();
    }

    var p = extractPointer(pointer);

    if (!types[p.key]) {
      return pointer;
    }

    return store.decoded[pointer].value;
  };

  var genSingleValueGenerateReference = function genSingleValueGenerateReference(type) {
    return function (store, key, index) {
      return new type(decodePointer(store, store.encoded[key][index][0]));
    };
  };

  var genArrayBufferGenerateReference = function genArrayBufferGenerateReference(type) {
    return function (store, key, index) {
      var encodedValues = store.encoded[key][index][0];
      var buffer = new type(encodedValues.length);
      var view = new Uint8Array(buffer);
      encodedValues.forEach(function (pointer, index) {
        view[index] = decodePointer(store, pointer);
      });
      return buffer;
    };
  };

  var genTypeArrayGenerateReference = function genTypeArrayGenerateReference(type) {
    return function (store, key, index) {
      return new type(store.encoded[key][index][0].length);
    };
  };
  /* istanbul ignore next */


  var genBlobLikeEncodeValue = function genBlobLikeEncodeValue(properties) {
    return function (store, dataItem) {
      return [[void 0].concat(properties.map(function (property) {
        return encounterItem(store, dataItem.value[property]);
      }))];
    };
  };
  /* istanbul ignore next */


  var blobLikeDeferredEncode = function blobLikeDeferredEncode(store, dataItem, callback) {
    var reader = new FileReader();
    reader.addEventListener('loadend', function () {
      var typedArray = new Uint8Array(reader.result);
      var typedArrayPointer = encounterItem(store, typedArray);
      var typedArrayP = extractPointer(typedArrayPointer);
      store[typedArrayP.key][typedArrayP.index] = [Array.from(typedArray).map(function (subItem) {
        var numberPointer = encounterItem(store, subItem);
        var numberP = extractPointer(numberPointer);

        if (store[numberP.key][numberP.index] === void 0) {
          store[numberP.key][numberP.index] = subItem;
        }

        return numberPointer;
      })];
      store[dataItem.key][dataItem.index][0][0] = typedArrayPointer;
      callback();
    });
    reader.readAsArrayBuffer(dataItem.value);
  };

  var types = {
    un: {
      // undefined
      build: function build() {
        return undefined;
      }
    },
    nl: {
      // null
      build: function build() {
        return null;
      }
    },
    na: {
      // NaN
      build: function build() {
        return NaN;
      }
    },
    nI: {
      // -Infinity
      build: function build() {
        return -Infinity;
      }
    },
    pI: {
      // Infinity
      build: function build() {
        return Infinity;
      }
    },
    n0: {
      // -0
      build: function build() {
        return -0;
      }
    },
    bt: {
      // true
      build: function build() {
        return true;
      }
    },
    bf: {
      // false
      build: function build() {
        return false;
      }
    },
    nm: {
      // Number
      systemName: 'Number',
      encodeValue: getDataItemValue,
      generateReference: function generateReference(store, key, index) {
        return store.encoded[key][index];
      },
      build: getDataItemValue
    },
    st: {
      // String
      systemName: 'String',
      encodeValue: getDataItemValue,
      generateReference: function generateReference(store, key, index) {
        return store.encoded[key][index];
      },
      build: getDataItemValue
    },
    sy: {
      // Symbol
      systemName: 'Symbol',
      encodeValue: function encodeValue(store, dataItem) {
        var symbolStringKey = Symbol.keyFor(dataItem.value);
        var isRegistered = symbolStringKey !== void 0;
        return [// For Registered Symbols, specify with 1 value and store the registered string value
        // For unique Symbols, specify with 0 value and also store the optional identifying string
        encounterItem(store, isRegistered ? 1 : 0), encounterItem(store, isRegistered ? symbolStringKey : String(dataItem.value).replace(/^Symbol\(|\)$/g, ''))];
      },
      generateReference: function generateReference(store, key, index) {
        var encodedValue = store.encoded[key][index];
        var typeNumber = decodePointer(store, encodedValue[0]);
        var identifierString = decodePointer(store, encodedValue[1]);
        return typeNumber === 1 ? Symbol.for(identifierString) : Symbol(identifierString);
      },
      build: getDataItemValue
    },
    ar: {
      // Array
      systemName: 'Array',
      encodeValue: arrayLikeEncodeValue,
      generateReference: function generateReference() {
        return [];
      },
      build: arrayLikeBuild
    },
    ag: {
      // Arguments
      systemName: 'Arguments',
      encodeValue: arrayLikeEncodeValue,
      generateReference: function generateReference(store, key, index) {
        return function () {
          return arguments;
        }.apply(null, Array.from({
          length: store.encoded[key][index][0].length
        }, function () {}));
      },
      build: arrayLikeBuild
    },
    ob: {
      // Object
      systemName: 'Object',
      encodeValue: function encodeValue() {
        return [];
      },
      generateReference: function generateReference() {
        return {};
      },
      build: function build(store, dataItem) {
        attachAttachments(store, dataItem, dataItem.parts);
      }
    },
    BO: {
      // Object-wrapped Boolean
      ignoreIndices: 1,
      encodeValue: objectWrappedEncodeValue,
      generateReference: genSingleValueGenerateReference(Boolean),
      build: attachAttachmentsSkipFirst
    },
    NM: {
      // Object-wrapped Number
      encodeValue: objectWrappedEncodeValue,
      generateReference: genSingleValueGenerateReference(Number),
      build: attachAttachmentsSkipFirst
    },
    ST: {
      // Object-wrapped String
      encodeValue: objectWrappedEncodeValue,
      generateReference: genSingleValueGenerateReference(String),
      build: attachAttachmentsSkipFirst
    },
    da: {
      // Date
      systemName: 'Date',
      encodeValue: function encodeValue(store, dataItem) {
        return [encounterItem(store, dataItem.value.getTime())];
      },
      generateReference: genSingleValueGenerateReference(Date),
      build: attachAttachmentsSkipFirst
    },
    re: {
      // RegExp
      systemName: 'RegExp',
      encodeValue: function encodeValue(store, dataItem) {
        return [[encounterItem(store, dataItem.value.source), encounterItem(store, dataItem.value.flags), encounterItem(store, dataItem.value.lastIndex)]];
      },
      generateReference: function generateReference(store, key, index) {
        var dataArray = store.encoded[key][index][0];
        var value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
        value.lastIndex = decodePointer(store, dataArray[2]);
        return value;
      },
      build: attachAttachmentsSkipFirst
    },
    er: {
      // Error
      systemName: 'Error',
      encodeValue: function encodeValue(store, dataItem) {
        return [[encounterItem(store, standardErrors[dataItem.value.name] ? dataItem.value.name : 'Error'), encounterItem(store, dataItem.value.message), encounterItem(store, dataItem.value.stack)]];
      },
      generateReference: function generateReference(store, key, index) {
        var dataArray = store.encoded[key][index][0];
        var value = new (standardErrors[decodePointer(store, dataArray[0])] || Error)(decodePointer(store, dataArray[1]));
        value.stack = decodePointer(store, dataArray[2]);
        return value;
      },
      build: attachAttachmentsSkipFirst
    },
    AB: {
      // ArrayBuffer
      systemName: 'ArrayBuffer',
      encodeValue: arrayBufferEncodeValue,
      generateReference: genArrayBufferGenerateReference(ArrayBuffer),
      build: attachAttachmentsSkipFirst
    },
    SA: {
      // SharedArrayBuffer
      systemName: 'SharedArrayBuffer',
      encodeValue: arrayBufferEncodeValue,
      generateReference: genArrayBufferGenerateReference(SharedArrayBuffer),
      build: attachAttachmentsSkipFirst
    },
    I1: {
      // Int8Array
      systemName: 'Int8Array',
      encodeValue: arrayLikeEncodeValue,
      generateReference: genTypeArrayGenerateReference(Int8Array),
      build: arrayLikeBuild
    },
    U1: {
      // Uint8Array
      systemName: 'Uint8Array',
      encodeValue: arrayLikeEncodeValue,
      generateReference: genTypeArrayGenerateReference(Uint8Array),
      build: arrayLikeBuild
    },
    C1: {
      // Uint8ClampedArray
      systemName: 'Uint8ClampedArray',
      encodeValue: arrayLikeEncodeValue,
      generateReference: genTypeArrayGenerateReference(Uint8ClampedArray),
      build: arrayLikeBuild
    },
    U2: {
      // Uint16Array
      systemName: 'Uint16Array',
      encodeValue: arrayLikeEncodeValue,
      generateReference: genTypeArrayGenerateReference(Uint16Array),
      build: arrayLikeBuild
    },
    I2: {
      // Int16Array
      systemName: 'Int16Array',
      encodeValue: arrayLikeEncodeValue,
      generateReference: genTypeArrayGenerateReference(Int16Array),
      build: arrayLikeBuild
    },
    I3: {
      // Int32Array
      systemName: 'Int32Array',
      encodeValue: arrayLikeEncodeValue,
      generateReference: genTypeArrayGenerateReference(Int32Array),
      build: arrayLikeBuild
    },
    U3: {
      // Uint32Array
      systemName: 'Uint32Array',
      encodeValue: arrayLikeEncodeValue,
      generateReference: genTypeArrayGenerateReference(Uint32Array),
      build: arrayLikeBuild
    },
    F3: {
      // Float32Array
      systemName: 'Float32Array',
      encodeValue: arrayLikeEncodeValue,
      generateReference: genTypeArrayGenerateReference(Float32Array),
      build: arrayLikeBuild
    },
    F4: {
      // Float64Array
      systemName: 'Float64Array',
      encodeValue: arrayLikeEncodeValue,
      generateReference: genTypeArrayGenerateReference(Float64Array),
      build: arrayLikeBuild
    },
    Se: {
      // Set
      systemName: 'Set',
      encodeValue: function encodeValue(store, dataItem) {
        return [Array.from(dataItem.value).map(function (subValue) {
          return encounterItem(store, subValue);
        })];
      },
      generateReference: function generateReference() {
        return new Set();
      },
      build: function build(store, dataItem) {
        dataItem.parts[0].forEach(function (pointer) {
          dataItem.value.add(getDecoded(store, pointer));
        });
        attachAttachmentsSkipFirst(store, dataItem);
      }
    },
    Ma: {
      // Map
      systemName: 'Map',
      encodeValue: function encodeValue(store, dataItem) {
        return [Array.from(dataItem.value).map(function (subValue) {
          return [encounterItem(store, subValue[0]), encounterItem(store, subValue[1])];
        })];
      },
      generateReference: function generateReference() {
        return new Map();
      },
      build: function build(store, dataItem) {
        dataItem.parts[0].forEach(function (pairs) {
          dataItem.value.set(getDecoded(store, pairs[0]), getDecoded(store, pairs[1]));
        });
        attachAttachmentsSkipFirst(store, dataItem);
      }
    },
    Bl: {
      // Blob
      systemName: 'Blob',
      encodeValue: genBlobLikeEncodeValue(['type']),
      deferredEncode: blobLikeDeferredEncode,
      generateReference:
      /* istanbul ignore next */
      function generateReference(store, key, index) {
        var dataArray = store.encoded[key][index][0];
        var p = extractPointer(dataArray[0]);
        return new Blob([new Uint8Array(store.encoded[p.key][p.index][0].map(function (pointer) {
          return decodePointer(store, pointer);
        }))], {
          type: decodePointer(store, dataArray[1])
        });
      },
      build: attachAttachmentsSkipFirst
    },
    Fi: {
      // File
      systemName: 'File',
      encodeValue: genBlobLikeEncodeValue(['name', 'type', 'lastModified']),
      deferredEncode: blobLikeDeferredEncode,
      generateReference:
      /* istanbul ignore next */
      function generateReference(store, key, index) {
        var dataArray = store.encoded[key][index][0];
        var p = extractPointer(dataArray[0]);
        return new File([new Uint8Array(store.encoded[p.key][p.index][0].map(function (pointer) {
          return decodePointer(store, pointer);
        }))], decodePointer(store, dataArray[1]), {
          type: decodePointer(store, dataArray[2]),
          lastModified: decodePointer(store, dataArray[3])
        });
      },
      build: attachAttachmentsSkipFirst
    }
  };

  var log = function log(a) {
    try {
      console.log(a);
    } catch (e) {// Do nothing
    }
  };

  var objectWrapperTypeNameMap = {
    'Boolean': 'BO',
    'Number': 'NM',
    'String': 'ST'
  }; // NOTE: Because Sets and Maps can accept any value as an entry (or key for Map), if unrecognized or unsupported types did not retain referencial integrity, data loss could occur.
  // For example, if they were replaced with null, any existing entry keyed with null in a Map would be overwritten. Likewise, the Set could have its order changed.

  var getPointerKey = function getPointerKey(v) {
    if (v === void 0) {
      // Specific support added, because these types didn't have a proper systemName prior to around 2010 Javascript
      return 'un';
    } else if (v === null) {
      // Specific support added, because these types didn't have a proper systemName prior to around 2010 Javascript
      return 'nl';
    } else if (v === true) {
      return 'bt';
    } else if (v === false) {
      return 'bf';
    } else if (typeof v === 'number') {
      if (v === Infinity) {
        return 'pI';
      }

      if (v === -Infinity) {
        return 'nI';
      }

      if (v !== v) {
        return 'na';
      }

      if (v === -0 && 1 / v === -Infinity) {
        return 'n0';
      }
    }

    var systemName = Object.prototype.toString.call(v).replace(/\[object |\]/g, '');

    if (_typeof(v) === 'object') {
      // Primitive types can sometimes be wrapped as Objects and must be handled differently
      var wrappedPointerKey = objectWrapperTypeNameMap[systemName];

      if (wrappedPointerKey) {
        return wrappedPointerKey;
      }
    }

    var pointerKey = Object.keys(types).find(function (typeKey) {
      if (systemName === types[typeKey].systemName) {
        return typeKey;
      }
    });

    if (!pointerKey) {
      log("Unsupported type \"".concat(systemName, "\". Value reference replaced with empty object:"));
      log(v);
      return 'ob';
    }

    return pointerKey;
  };

  var prepExplorableItem = function prepExplorableItem(store, item) {
    if (store._.references.get(item) === void 0 && !isSimple(getPointerKey(item))) {
      store._.explore.push(item);
    }
  };

  var encounterItem = function encounterItem(store, item) {
    var pointerKey = getPointerKey(item);

    if (isSimple(pointerKey)) {
      return pointerKey;
    }

    var existingDataItem = store._.references.get(item);

    if (existingDataItem !== void 0) {
      return existingDataItem.pointer;
    } // Ensure location exists


    store[pointerKey] = store[pointerKey] || []; // Add temp value to update the location

    store[pointerKey].push(void 0);
    var pointerIndex = store[pointerKey].length - 1;
    var dataItem = {
      key: pointerKey,
      index: pointerIndex,
      pointer: pointerKey + pointerIndex,
      value: item,
      indices: [],
      attachments: []
    }; // Store the reference uniquely along with location information

    store._.references.set(item, dataItem);
    /* istanbul ignore next */


    if (types[pointerKey].deferredEncode) {
      store._.deferred.push(dataItem);
    }

    var _getAttachments = getAttachments(item),
        indices = _getAttachments.indices,
        attachments = _getAttachments.attachments; // Object-wrapped Strings will include indices for each character in the string


    if (types[pointerKey].ignoreIndices) {
      indices = [];
    } // Save the known attachments for the next phase so we do not have to reacquire them


    dataItem.indices = indices;
    dataItem.attachments = attachments; // Prep sub-items to be explored later

    indices.forEach(function (s) {
      prepExplorableItem(store, s);
    });
    attachments.forEach(function (s) {
      prepExplorableItem(store, s[0]);
      prepExplorableItem(store, s[1]);
    });
    return dataItem.pointer;
  };

  var prepOutput = function prepOutput(store, onFinish, root) {
    delete store._;
    store.r = root;
    store.v = '1.0.0';
    var output = Object.keys(store).map(function (key) {
      return [key, store[key]];
    });

    if (typeof onFinish === 'function') {
      onFinish(output);
      return;
    }

    return output;
  };

  var encode = function encode(value, onFinish) {
    var store = {
      _: {
        references: new Map(),
        // Known References
        explore: [],
        // Exploration queue
        deferred: [] // Deferment List of dataItems to encode later, in callback form, such as blobs and files, which are non-synchronous by design

      }
    };
    var rootPointerKey = getPointerKey(value); // Root value is simple, can skip main encoding steps

    if (isSimple(rootPointerKey)) {
      return prepOutput(store, onFinish, rootPointerKey);
    }

    store._.explore.push(value);

    while (store._.explore.length) {
      encounterItem(store, store._.explore.shift());
    }

    store._.references.forEach(function (dataItem) {
      store[dataItem.key][dataItem.index] = types[dataItem.key].encodeValue(store, dataItem);

      if (dataItem.attachments.length > 0) {
        store[dataItem.key][dataItem.index] = store[dataItem.key][dataItem.index].concat(dataItem.attachments.map(function (attachment) {
          return [encounterItem(store, attachment[0]), encounterItem(store, attachment[1])];
        }));
      }
    });

    if (store._.deferred.length === 0) {
      return prepOutput(store, onFinish, store._.references.get(value).pointer);
    } // Handle Blob or File type encoding

    /* istanbul ignore next */


    if (typeof onFinish !== 'function') {
      throw 'Callback function required when encoding deferred objects such as File and Blob.';
    }
    /* istanbul ignore next */


    var deferredLength = store._.deferred.length;
    /* istanbul ignore next */

    var onCallback = function onCallback() {
      deferredLength -= 1;

      if (deferredLength === 0) {
        return prepOutput(store, onFinish, store._.references.get(value).pointer);
      }
    };
    /* istanbul ignore next */


    store._.deferred.forEach(function (dataItem) {
      types[dataItem.key].deferredEncode(store, dataItem, onCallback);
    });
  }; // Recursively look at the reference set for exploration values
  // This handles both pair arrays and individual values
  // This recursion is fine because it has a maximum depth of 3


  var exploreParts = function exploreParts(store, parts) {
    if (getPointerKey(parts) === 'ar') {
      parts.forEach(function (part) {
        exploreParts(store, part);
      });
    } else {
      store.explore.push(parts);
    }
  };

  var explorePointer = function explorePointer(store, pointer) {
    var p = extractPointer(pointer);

    if (!types[p.key] || store.decoded[pointer] !== void 0 || isSimple(p.key)) {
      return;
    }

    var dataItem = {
      key: p.key,
      index: p.index,
      pointer: pointer,
      value: void 0,
      parts: []
    };
    store.decoded[pointer] = dataItem;
    dataItem.value = types[p.key].generateReference(store, dataItem.key, dataItem.index);
    dataItem.parts = store.encoded[dataItem.key][dataItem.index];

    if (getPointerKey(dataItem.parts) === 'ar') {
      exploreParts(store, dataItem.parts);
    }
  };

  var decode = function decode(encoded) {
    var store = {
      encoded: encoded.reduce(function (accumulator, e) {
        accumulator[e[0]] = e[1];
        return accumulator;
      }, {}),
      decoded: {},
      explore: []
    };
    var rootP = extractPointer(store.encoded.r); // Unrecognized root type, return pointer

    if (!types[rootP.key]) {
      return store.encoded.r;
    }

    if (isSimple(rootP.key)) {
      return types[rootP.key].build();
    }

    store.explore.push(store.encoded.r);

    while (store.explore.length) {
      explorePointer(store, store.explore.shift());
    }

    Object.values(store.decoded).forEach(function (dataItem) {
      types[dataItem.key].build(store, dataItem);
    });
    return store.decoded[store.encoded.r].value;
  };

  var main = {
    encode: encode,
    decode: decode
  };
  return main;
});