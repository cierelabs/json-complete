var genError = (message, operation, type) => {
    const error = new Error(message);
    error.operation = operation;
    error.type = type;
    return error;
};

var getSystemName = (v) => {
    return Object.prototype.toString.call(v).slice(8, -1);
};

const getAttachments = (v, encodeSymbolKeys) => {
    const attached = {
        _indices: [],
        _attachments: [],
    };

    // Find all indices
    const indices = [];
    const indexObj = {};
    // Objects not based on Arrays, like Objects and Sets, will not find any indices here because we are using the Array.prototype.forEach
    Array.prototype.forEach.call(v, (value, index) => {
        indexObj[String(index)] = 1;
        indices.push(index);
    });

    // Have to use external index iterator because we want the counting to stop once the first index incongruity occurs
    let i = 0;

    // Find all String keys that are not indices
    // For Arrays, TypedArrays, and Object-Wrapped Strings, the keys list will include indices as strings, so account for that by checking the indexObj
    let keys = Object.keys(v).filter((key) => {
        return !indexObj[key];
    });

    if (encodeSymbolKeys) {
        keys = keys.concat(Object.getOwnPropertySymbols(v).filter((symbol) => {
            // Ignore built-in Symbols
            // If the Symbol ID that is part of the Symbol global is not equal to the tested Symbol, then it is NOT a built-in Symbol
            return Symbol[String(symbol).slice(14, -1)] !== symbol;
        }));
    }

    // Create the lists
    return indices.concat(keys).reduce((accumulator, key) => {
        if (key === i) {
            i += 1;
            accumulator._indices.push(v[key]);
        }
        else {
            accumulator._attachments.push([key, v[key]]);
        }
        return accumulator;
    }, attached);
};

const wrappedPrimitives = {
    Boolean: 'Bo', // Object-Wrapped Boolean
    Number: 'NU', // Object-Wrapped Number
    String: 'ST', // Object-Wrapped String
};

const findTypeKey = (types, item) => {
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

        if (item === 0 && (1 / item) === -Infinity) {
            return 'n0';
        }
    }

    const systemName = getSystemName(item);

    if (typeof item === 'object' && wrappedPrimitives[systemName]) {
        return wrappedPrimitives[systemName];
    }

    return Object.keys(types).find((typeKey) => {
        return systemName === types[typeKey]._systemName;
    });
};

const getPointerKey = (store, item) => {
    const pointerKey = findTypeKey(store._types, item);

    if (!pointerKey && !store._safe) {
        const type = getSystemName(item);
        throw genError(`Cannot encode unsupported type "${type}".`, 'encode', type);
    }

    // In safe mode, Unsupported types are stored as plain, empty objects, so that they retain their referencial integrity, but can still handle attachments
    return pointerKey ? pointerKey : 'Ob';
};

const prepExplorableItem = (store, item) => {
    // Type is known type and is a reference type (not simple), it should be explored
    if (store._types[getPointerKey(store, item)]._build) {
        store._explore.push(item);
    }
};

var encounterItem = (store, item) => {
    const pointerKey = getPointerKey(store, item);

    // Simple type, return pointer (pointer key)
    if (!store._types[pointerKey]._build) {
        return pointerKey;
    }

    // Already encountered, return pointer
    const existingDataItem = store._references.get(item);
    if (existingDataItem !== void 0) {
        return existingDataItem._pointer;
    }

    // Ensure location exists
    store._output[pointerKey] = store._output[pointerKey] || [];

    // Add temp value to update the location
    store._output[pointerKey].push(void 0);

    const pointerIndex = store._output[pointerKey].length - 1;

    const attached = getAttachments(item, store._encodeSymbolKeys);

    const dataItem = {
        _key: pointerKey,
        _index: pointerIndex,
        _pointer: pointerKey + pointerIndex,
        _reference: item,

        // Save the known attachments for the next phase so we do not have to reacquire them
        // Strings and Object-wrapped Strings will include indices for each character in the string, so ignore them
        _indices: store._types[pointerKey]._ignoreIndices ? [] : attached._indices,
        _attachments: attached._attachments,
    };

    // Store the reference uniquely along with location information
    store._references.set(item, dataItem);

    // Some values can only be obtained asynchronously, so add them to a list of items to check
    /* istanbul ignore next */
    if (store._types[pointerKey]._deferredEncode) {
        store._deferred.push(dataItem);
    }

    // Prep sub-items to be explored later
    dataItem._indices.forEach((s) => {
        prepExplorableItem(store, s);
    });
    dataItem._attachments.forEach((s) => {
        prepExplorableItem(store, s[0]);
        prepExplorableItem(store, s[1]);
    });

    return dataItem._pointer;
};

var arrayLikeEncodeValue = (store, dataItem) => {
    return [
        dataItem._indices.map((subValue) => {
            return encounterItem(store, subValue);
        }),
    ];
};

var extractPointer = (pointer) => {
    return {
        _key: pointer.slice(0, 2),
        _index: parseInt(pointer.slice(2), 10),
    };
};

// This is the function for getting pointer references in the build functions
var getDecoded = (store, pointer) => {
    // Simple type, return the value
    if (store._types[pointer]) {
        return store._types[pointer]._value;
    }

    // Normal type, return the reference
    const p = extractPointer(pointer);
    if (store._types[p._key]) {
        return store._decoded[pointer]._reference;
    }

    // We will never reach this point without being in safe mode, return the pointer string
    return pointer;
};

var attachAttachments = (store, dataItem, attachments) => {
    attachments.forEach((pair) => {
        dataItem._reference[getDecoded(store, pair[0])] = getDecoded(store, pair[1]);
    });
};

var attachAttachmentsSkipFirst = (store, dataItem) => {
    attachAttachments(store, dataItem, dataItem._parts.slice(1));
};

// This is the function for getting pointer values in the generateReference functions
var decodePointer = (store, pointer) => {
    if (store._types[pointer]) {
        return store._types[pointer]._value;
    }

    const p = extractPointer(pointer);

    return store._types[p._key]._generateReference(store, p._key, p._index);
};

const genArrayBuffer = (type) => {
    return {
        _systemName: getSystemName(new type()),
        _encodeValue: (store, dataItem) => {
            // Might have used Array.from here, but it isn't supported in IE
            dataItem._indices = Array.prototype.slice.call(new Uint8Array(dataItem._reference));
            return arrayLikeEncodeValue(store, dataItem);
        },
        _generateReference: (store, key, index) => {
            const encodedValues = store._encoded[key][index][0];
            const buffer = new type(encodedValues.length);
            const view = new Uint8Array(buffer);
            encodedValues.forEach((pointer, index) => {
                view[index] = decodePointer(store, pointer);
            });
            return buffer;
        },
        _build: attachAttachmentsSkipFirst,
    };
};

var ArrayBufferTypes = (typeObj) => {
    /* istanbul ignore else */
    if (typeof ArrayBuffer === 'function') {
        typeObj.AB = genArrayBuffer(ArrayBuffer);
    }

    // Support does not exist or was removed from most environments due to Spectre and Meltdown vulnerabilities
    // https://caniuse.com/#feat=sharedarraybuffer
    /* istanbul ignore else */
    if (typeof SharedArrayBuffer === 'function') {
        typeObj.Sh = genArrayBuffer(SharedArrayBuffer);
    }

    return typeObj;
};

var arrayLikeBuild = (store, dataItem) => {
    dataItem._parts[0].forEach((pointer, index) => {
        dataItem._reference[index] = getDecoded(store, pointer);
    });

    attachAttachmentsSkipFirst(store, dataItem);
};

var ArrayLikeTypes = (typeObj) => {
    typeObj.Ar = {
        _systemName: 'Array',
        _encodeValue: arrayLikeEncodeValue,
        _generateReference: () => {
            return [];
        },
        _build: arrayLikeBuild,
    };

    typeObj.rg = {
        _systemName: 'Arguments',
        _encodeValue: arrayLikeEncodeValue,
        _generateReference: (store, key, index) => {
            return (function() {
                return arguments;
            }).apply(null, Array(store._encoded[key][index][0].length));
        },
        _build: arrayLikeBuild,
    };

    return typeObj;
};

var BasePrimitiveTypes = (typeObj) => {
    typeObj.St = {
        _ignoreIndices: 1, // Strings allow index access into the string value, which is already stored, so ignore indices
        _systemName: 'String',
        _encodeValue: (store, dataItem) => {
            return dataItem._reference;
        },
        _generateReference: (store, key, index) => {
            return store._encoded[key][index];
        },
        _build: () => {},
    };

    typeObj.Nu = {
        _systemName: 'Number',
        _encodeValue: (store, dataItem) => {
            return encounterItem(store, String(dataItem._reference));
        },
        _generateReference: (store, key, index) => {
            return parseFloat(decodePointer(store, store._encoded[key][index]));
        },
        _build: () => {},
    };

    return typeObj;
};

var BigIntType = (typeObj) => {
    /* istanbul ignore if */
    if (typeof BigInt === 'function') {
        typeObj.Bi = {
            _systemName: 'BigInt',
            _encodeValue: (store, dataItem) => {
                return encounterItem(store, String(dataItem._reference));
            },
            _generateReference: (store, key, index) => {
                return BigInt(decodePointer(store, store._encoded[key][index]));
            },
            _build: () => {},
        };
    }

    return typeObj;
};

/* istanbul ignore next */
const genBlobLike = (systemName, propertiesKeys, create) => {
    return {
        _systemName: systemName,
        _deferredEncode: (store, dataItem, callback) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                dataItem._deferredValuePointer = encounterItem(store, new Uint8Array(reader.result));
                callback();
            });
            reader.readAsArrayBuffer(dataItem._reference);
        },
        _encodeValue: (store, dataItem) => {
            return [
                [dataItem._deferredValuePointer].concat(propertiesKeys.map((property) => {
                    return encounterItem(store, dataItem._reference[property]);
                })),
            ];
        },
        _generateReference: (store, key, index) => {
            const dataArray = store._encoded[key][index][0];
            const p = extractPointer(dataArray[0]);

            return create(store, [new Uint8Array(store._encoded[p._key][p._index][0].map((pointer) => {
                return decodePointer(store, pointer);
            }))], dataArray);
        },
        _build: attachAttachmentsSkipFirst,
    };
};

var BlobTypes = (typeObj) => {
    // Supported back to IE10
    /* istanbul ignore if */
    if (typeof Blob === 'function') {
        typeObj.Bl = genBlobLike('Blob', ['type'], (store, buffer, dataArray) => {
            return new Blob(buffer, {
                type: decodePointer(store, dataArray[1]),
            });
        });
    }

    // Supported back to IE10, but it doesn't support the File constructor
    /* istanbul ignore if */
    if (typeof File === 'function') {
        typeObj.Fi = genBlobLike('File', ['name', 'type', 'lastModified'], (store, buffer, dataArray) => {
            return new File(buffer, decodePointer(store, dataArray[1]), {
                type: decodePointer(store, dataArray[2]),
                lastModified: decodePointer(store, dataArray[3])
            });
        });
    }

    return typeObj;
};

var DateType = (typeObj) => {
    typeObj.Da = {
        _systemName: 'Date',
        _encodeValue: (store, dataItem) => {
            return [
                encounterItem(store, dataItem._reference.valueOf()),
            ];
        },
        _generateReference: (store, key, index) => {
            return new Date(decodePointer(store, store._encoded[key][index][0]));
        },
        _build: attachAttachmentsSkipFirst,
    };

    return typeObj;
};

const standardErrors = {
    'EvalError': EvalError,
    'RangeError': RangeError,
    'ReferenceError': ReferenceError,
    'SyntaxError': SyntaxError,
    'TypeError': TypeError,
    'URIError': URIError,
};

var ErrorType = (typeObj) => {
    typeObj.Er = {
        _systemName: 'Error',
        _encodeValue: (store, dataItem) => {
            return [
                [
                    encounterItem(store, standardErrors[dataItem._reference.name] ? dataItem._reference.name : 'Error'),
                    encounterItem(store, dataItem._reference.message),
                    encounterItem(store, dataItem._reference.stack),
                ],
            ];
        },
        _generateReference: (store, key, index) => {
            const dataArray = store._encoded[key][index][0];

            const value = new (standardErrors[decodePointer(store, dataArray[0])] || Error)(decodePointer(store, dataArray[1]));
            value.stack = decodePointer(store, dataArray[2]);

            return value;
        },
        _build: attachAttachmentsSkipFirst,
    };

    return typeObj;
};

var KeyedCollectionTypes = (typeObj) => {
    // If Set is supported, Map is also supported
    /* istanbul ignore else */
    if (typeof Set === 'function') {
        typeObj.Se = {
            _systemName: 'Set',
            _encodeValue: (store, dataItem) => {
                return [
                    Array.from(dataItem._reference).map((subValue) => {
                        return encounterItem(store, subValue);
                    }),
                ];
            },
            _generateReference: () => {
                return new Set();
            },
            _build: (store, dataItem) => {
                dataItem._parts[0].forEach((subPointer) => {
                    dataItem._reference.add(getDecoded(store, subPointer));
                });

                attachAttachmentsSkipFirst(store, dataItem);
            },
        };

        typeObj.Ma = {
            _systemName: 'Map',
            _encodeValue: (store, dataItem) => {
                return [
                    Array.from(dataItem._reference).map((subValue) => {
                        return [encounterItem(store, subValue[0]), encounterItem(store, subValue[1])];
                    }),
                ];
            },
            _generateReference: () => {
                return new Map();
            },
            _build: (store, dataItem) => {
                dataItem._parts[0].forEach((subPointers) => {
                    dataItem._reference.set(getDecoded(store, subPointers[0]), getDecoded(store, subPointers[1]));
                });

                attachAttachmentsSkipFirst(store, dataItem);
            },
        };
    }

    return typeObj;
};

var ObjectType = (typeObj) => {
    typeObj.Ob = {
        _systemName: 'Object',
        _encodeValue: () => {
            return [];
        },
        _generateReference: () => {
            return {};
        },
        _build: (store, dataItem) => {
            attachAttachments(store, dataItem, dataItem._parts);
        },
    };

    return typeObj;
};

var RegExpType = (typeObj) => {
    typeObj.Re = {
        _systemName: 'RegExp',
        _encodeValue: (store, dataItem) => {
            const reference = dataItem._reference;
            return [
                [
                    encounterItem(store, reference.source),
                    // Edge and IE use `options` parameter instead of `flags`, regardless of what it says on MDN
                    encounterItem(store, reference.flags === void 0 ? reference.options : reference.flags),
                    encounterItem(store, reference.lastIndex),
                ],
            ];
        },
        _generateReference: (store, key, index) => {
            const dataArray = store._encoded[key][index][0];
            const value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
            value.lastIndex = decodePointer(store, dataArray[2]);
            return value;
        },
        _build: attachAttachmentsSkipFirst,
    };

    return typeObj;
};

var SimpleTypes = (typeObj) => {
    typeObj.un = { _value: void 0 };
    typeObj.nl = { _value: null };
    typeObj.tr = { _value: true };
    typeObj.fa = { _value: false };
    typeObj.pI = { _value: Infinity };
    typeObj.nI = { _value: -Infinity };
    typeObj.Na = { _value: NaN };
    typeObj.n0 = { _value: -0 };

    return typeObj;
};

var SymbolType = (typeObj) => {
    /* istanbul ignore else */
    if (typeof Symbol === 'function') {
        typeObj.Sy = {
            _systemName: 'Symbol',
            _encodeValue: (store, dataItem) => {
                const symbolStringKey = Symbol.keyFor(dataItem._reference);
                const isRegistered = symbolStringKey !== void 0;

                return [
                    // For Registered Symbols, specify with true value and store the registered string value
                    // For unique Symbols, specify with false value and also store the optional identifying string
                    encounterItem(store, isRegistered ? true : false),
                    encounterItem(store, isRegistered ? symbolStringKey : String(dataItem._reference).slice(7, -1)),
                ];
            },
            _generateReference: (store, key, index) => {
                const encodedValue = store._encoded[key][index];
                const identifierString = decodePointer(store, encodedValue[1]);

                return decodePointer(store, encodedValue[0]) ? Symbol.for(identifierString) : Symbol(identifierString);
            },
            _build: () => {}, // Symbols doesn't allow attachments, no-op
        };
    }

    return typeObj;
};

const genTypedArray = (type) => {
    return {
        _systemName: getSystemName(new type()),
        _encodeValue: arrayLikeEncodeValue,
        _generateReference: (store, key, index) => {
            return new type(store._encoded[key][index][0].length);
        },
        _build: arrayLikeBuild,
    };
};

var TypedArrayTypes = (typeObj) => {
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
    }

    // IE10 and IE Mobile do not support Uint8ClampedArray
    // https://caniuse.com/#feat=typedarrays
    /* istanbul ignore else */
    if (typeof Uint8ClampedArray === 'function') {
        typeObj.C1 = genTypedArray(Uint8ClampedArray);
    }

    // Safari versions prior to 5.1 might not support the Float64ArrayType, even as they support other TypeArray types
    // https://caniuse.com/#feat=typedarrays
    /* istanbul ignore else */
    if (typeof Float64Array === 'function') {
        typeObj.F4 = genTypedArray(Float64Array);
    }

    return typeObj;
};

const genWrappedPrimitive = (type) => {
    return {
        // The type is determined elsewhere
        _systemName: '',
        _encodeValue: (store, dataItem) => {
            return [
                encounterItem(store, dataItem._reference.valueOf()),
            ];
        },
        _generateReference: (store, key, index) => {
            return new type(decodePointer(store, store._encoded[key][index][0]));
        },
        _build: attachAttachmentsSkipFirst,
    };
};

var WrappedPrimitiveTypes = (typeObj) => {
    typeObj.Bo = genWrappedPrimitive(Boolean);

    typeObj.NU = genWrappedPrimitive(Number);

    typeObj.ST = genWrappedPrimitive(String);

    // String Objects allow index access into the string value, which is already stored, so ignore indices
    typeObj.ST._ignoreIndices = 1;

    return typeObj;
};

let types = {};
types = SimpleTypes(types);
types = BasePrimitiveTypes(types);
types = WrappedPrimitiveTypes(types);
types = ArrayLikeTypes(types);
types = ObjectType(types);
types = DateType(types);
types = RegExpType(types);
types = ErrorType(types);

// TODO: Exclude from legacy version
types = SymbolType(types);
types = KeyedCollectionTypes(types);
types = TypedArrayTypes(types);
types = ArrayBufferTypes(types);
types = BlobTypes(types);
types = BigIntType(types);

var types$1 = types;

const prepOutput = (store, root) => {
    // Having found all data structure contents, encode each value into the encoded output
    store._references.forEach((dataItem) => {
        // Encode the actual value
        store._output[dataItem._key][dataItem._index] = types$1[dataItem._key]._encodeValue(store, dataItem);

        // Encode any values attached to the value
        if (dataItem._attachments.length > 0) {
            store._output[dataItem._key][dataItem._index] = store._output[dataItem._key][dataItem._index].concat(dataItem._attachments.map((attachment) => {
                // Technically, here we might expect to only request items from the already explored set
                // However, some types, particularly non-attachment containers, like Set and Map, can contain additional values not explored
                // By encountering attachments after running the encodeValue function, additional, hidden values in the container can be added to the reference set
                return [
                    encounterItem(store, attachment[0]),
                    encounterItem(store, attachment[1]),
                ];
            }));
        }
    });

    store._output.r = root;
    store._output.v = '1.0.0';

    // Convert the output object form to an output array form
    const output = Object.keys(store._output).map((key) => {
        return [
            key,
            store._output[key],
        ];
    });

    if (typeof store._onFinish === 'function') {
        store._onFinish(output);
    }
    else {
        return output;
    }
};

var encode = (value, options) => {
    options = options || {};

    const store = {
        _safe: options.safeMode,
        _encodeSymbolKeys: options.encodeSymbolKeys,
        _onFinish: options.onFinish,
        _types: types$1,
        _references: new Map(), // Known References
        _explore: [], // Exploration queue
        _deferred: [], // Deferment List of dataItems to encode later, in callback form, such as blobs and files, which are non-synchronous by design
        _output: {},
    };

    const rootPointerKey = encounterItem(store, value);

    // Root value is simple, can skip main encoding steps
    if (types$1[rootPointerKey]) {
        return prepOutput(store, rootPointerKey);
    }

    // Explore through the data structure
    store._explore.push(value);
    while (store._explore.length) {
        encounterItem(store, store._explore.shift());
    }

    /* istanbul ignore next */
    if (store._deferred.length > 0) {
        // Handle Blob or File type encoding
        if (typeof options.onFinish !== 'function') {
            if (store._safe) {
                // In safe mode, if the onFinish function is not provided, File and Blob object data will be discarded as empty and returns data immediately
                return prepOutput(store, rootPointerKey);
            }

            throw genError('Found deferred type, but no onFinish option provided.', 'encode');
        }

        let deferredLength = store._deferred.length;

        const onCallback = () => {
            deferredLength -= 1;
            if (deferredLength === 0) {
                return prepOutput(store, rootPointerKey);
            }
        };

        store._deferred.forEach((dataItem) => {
            types$1[dataItem._key]._deferredEncode(store, dataItem, onCallback);
        });

        return;
    }

    // Normal output without deferment
    return prepOutput(store, rootPointerKey);
};

// Recursively look at the reference set for exploration values
// This handles both pair arrays and individual values
// This recursion is fine because it has a maximum depth of around 3
const exploreParts = (store, parts) => {
    if (getSystemName(parts) === 'Array') {
        parts.forEach((part) => {
            exploreParts(store, part);
        });
    }
    else {
        store._explore.push(parts);
    }
};

const explorePointer = (store, pointer) => {
    const p = extractPointer(pointer);

    // Unknown pointer type
    if (!types$1[p._key]) {
        // In safe mode, ignore
        if (store._safe) {
            return;
        }

        throw genError(`Cannot decode unrecognized pointer type "${p._key}".`, 'decode', p._key);
    }

    // If a simple pointer or an already explored pointer, ignore
    if (types$1[pointer] || store._decoded[pointer] !== void 0) {
        return;
    }

    store._decoded[pointer] = {
        _key: p._key,
        _index: p._index,
        _pointer: pointer,
        _reference: void 0,
        _parts: store._encoded[p._key][p._index],
    };

    try {
        store._decoded[pointer]._reference = types$1[p._key]._generateReference(store, p._key, p._index);
    } catch (e) {
        // This can happen if the data is malformed, or if the environment does not support the type attempting to be created
        throw genError(`Cannot generate recognized object type from pointer type "${p._key}".`, 'decode');
    }

    if (getSystemName(store._decoded[pointer]._parts) === 'Array') {
        exploreParts(store, store._decoded[pointer]._parts);
    }
};

var decode = (encoded, options) => {
    options = options || {};

    const store = {
        _safe: options.safeMode,
        _types: types$1,
        _encoded: encoded.reduce((accumulator, e) => {
            accumulator[e[0]] = e[1];
            return accumulator;
        }, {}),
        _decoded: {},
        _explore: [],
    };

    const rootPointerKey = store._encoded.r;

    // Simple pointer, return value
    if (types$1[rootPointerKey]) {
        return types$1[rootPointerKey]._value;
    }

    const rootP = extractPointer(rootPointerKey);

    // Unrecognized root type
    if (!types$1[rootP._key]) {
        if (store._safe) {
            return rootPointerKey;
        }

        throw genError(`Cannot decode unrecognized pointer type "${rootP._key}".`, 'decode', rootP._key);
    }

    // Explore through data structure
    store._explore.push(rootPointerKey);
    while (store._explore.length) {
        explorePointer(store, store._explore.shift());
    }

    // Having explored all of the data structure, fill out data and references
    Object.values(store._decoded).forEach((dataItem) => {
        types$1[dataItem._key]._build(store, dataItem);
    });

    return store._decoded[rootPointerKey]._reference;
};

var main = {
    encode: encode,
    decode: decode,
};

export default main;
