var getSystemName = (v) => {
    return Object.prototype.toString.call(v).slice(8, -1);
};

const getAttachments = (v) => {
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
    }).concat(Object.getOwnPropertySymbols(v).filter((symbol) => {
        // Ignore built-in Symbols
        // If the Symbol ID that is part of the Symbol global is not equal to the tested Symbol, then it is NOT a built-in Symbol
        return Symbol[String(symbol).slice(14, -1)] !== symbol;
    }));

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

const getPointerKey = (store, item) => {
    const pointerKey = Object.keys(store._types).find((typeKey) => {
        return store._types[typeKey]._identify(item);
    });

    if (!pointerKey && !store._safe) {
        throw(new Error(`Cannot encode unsupported type "${getSystemName(item)}".`));
    }

    // In safe mode, Unsupported types are stored as plain, empty objects, so that they retain their referencial integrity, but can still handle attachments
    return pointerKey ? pointerKey : 'ob';
};

const prepExplorableItem = (store, item) => {
    // Type is known type and is a reference type (not simple), it should be explored
    if ((store._types[getPointerKey(store, item)] || {})._build) {
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

    const attached = getAttachments(item);

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

var genSimpleEqualityType = (value) => {
    return {
        _identify: (v) => {
            return v === value;
        },
        _value: value,
    };
};

var undefinedType = genSimpleEqualityType(void 0);

var nullType = genSimpleEqualityType(null);

var NaNType = {
    _identify: (v) => {
        return v !== v;
    },
    _value: NaN,
};

var InfinityType = genSimpleEqualityType(Infinity);

var NegativeInfinityType = genSimpleEqualityType(-Infinity);

var Negative0Type = {
    _identify: (v) => {
        return v === 0 && (1 / v) === -Infinity;
    },
    _value: -0,
};

var trueType = genSimpleEqualityType(true);

var falseType = genSimpleEqualityType(false);

var extractPointer = (pointer) => {
    return {
        _key: pointer.slice(0, 2),
        _index: parseInt(pointer.slice(2), 10),
    };
};

// This is the function for getting pointer values in the generateReference functions
var decodePointer = (store, pointer) => {
    if (store._types[pointer]) {
        return store._types[pointer]._value;
    }

    const p = extractPointer(pointer);

    return store._types[p._key]._generateReference(store, p._key, p._index);
};

var genPrimitive = (systemName, type, encodeValue, generateReference) => {
    return {
        _identify: (v) => {
            return getSystemName(v) === systemName && !(v instanceof type);
        },
        _encodeValue: encodeValue,
        _generateReference: generateReference,
        _build: () => {},
    };
};

var NumberType = genPrimitive('Number', Number, (store, dataItem) => {
    return encounterItem(store, String(dataItem._reference));
}, (store, key, index) => {
    return parseFloat(decodePointer(store, store._encoded[key][index]));
});

var StringType = Object.assign({
    // Strings allow index access into the string value, which is already stored, so ignore indices
    _ignoreIndices: 1,
}, genPrimitive('String', String, (store, dataItem) => {
    return dataItem._reference;
}, (store, key, index) => {
    return store._encoded[key][index];
}));

var genDoesMatchSystemName = (systemName) => {
    return (v) => {
        return getSystemName(v) === systemName;
    };
};

var tryCreateType = (typeOf, typeCreator) => {
    return typeOf === 'function' ? typeCreator() : {
        _identify: () => {},
    };
};

var SymbolType = tryCreateType(typeof Symbol, () => {
    return {
        _identify: genDoesMatchSystemName('Symbol'),
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
});

var arrayLikeEncodeValue = (store, dataItem) => {
    return [
        dataItem._indices.map((subValue) => {
            return encounterItem(store, subValue);
        }),
    ];
};

// This is the function for getting pointer references in the build functions
var getDecoded = (store, pointer) => {
    if (store._types[pointer]) {
        return store._types[pointer]._value;
    }

    const p = extractPointer(pointer);
    if (store._types[p._key]) {
        return store._decoded[pointer]._reference;
    }

    if (store._safe) {
        return pointer;
    }

    throw new Error(`Cannot decode unrecognized pointer type "${p._key}".`);
};

var attachAttachments = (store, dataItem, attachments) => {
    attachments.forEach((pair) => {
        dataItem._reference[getDecoded(store, pair[0])] = getDecoded(store, pair[1]);
    });
};

var attachAttachmentsSkipFirst = (store, dataItem) => {
    attachAttachments(store, dataItem, dataItem._parts.slice(1));
};

var genArrayLike = (systemName, generateReference) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: arrayLikeEncodeValue,
        _generateReference: generateReference,
        _build: (store, dataItem) => {
            dataItem._parts[0].forEach((pointer, index) => {
                dataItem._reference[index] = getDecoded(store, pointer);
            });

            attachAttachmentsSkipFirst(store, dataItem);
        },
    };
};

var ArrayType = genArrayLike('Array', () => {
    return [];
});

var ArgumentsType = genArrayLike('Arguments', (store, key, index) => {
    return (function() {
        return arguments;
    }).apply(null, Array(store._encoded[key][index][0].length));
});

var ObjectType = {
    _identify: genDoesMatchSystemName('Object'),
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

var genPrimitiveObject = (systemName, type) => {
    return {
        _identify: (v) => {
            return getSystemName(v) === systemName && v instanceof type;
        },
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

var BooleanObjectType = genPrimitiveObject('Boolean', Boolean);

var NumberObjectType = genPrimitiveObject('Number', Number);

var StringObjectType = Object.assign({
    // String Objects allow index access into the string value, which is already stored, so ignore indices
    _ignoreIndices: 1,
}, genPrimitiveObject('String', String));

var DateType = genPrimitiveObject('Date', Date);

var genAttachableValueObject = (systemName, encodeValue, generateReference) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: encodeValue,
        _generateReference: generateReference,
        _build: attachAttachmentsSkipFirst,
    };
};

var RegExpType = genAttachableValueObject('RegExp', (store, dataItem) => {
    return [
        [
            encounterItem(store, dataItem._reference.source),
            encounterItem(store, dataItem._reference.flags),
            encounterItem(store, dataItem._reference.lastIndex),
        ],
    ];
}, (store, key, index) => {
    const dataArray = store._encoded[key][index][0];
    const value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
    value.lastIndex = decodePointer(store, dataArray[2]);
    return value;
});

const standardErrors = {
    'EvalError': EvalError,
    'RangeError': RangeError,
    'ReferenceError': ReferenceError,
    'SyntaxError': SyntaxError,
    'TypeError': TypeError,
    'URIError': URIError,
};

var ErrorType = genAttachableValueObject('Error', (store, dataItem) => {
    return [
        [
            encounterItem(store, standardErrors[dataItem._reference.name] ? dataItem._reference.name : 'Error'),
            encounterItem(store, dataItem._reference.message),
            encounterItem(store, dataItem._reference.stack),
        ],
    ];
}, (store, key, index) => {
    const dataArray = store._encoded[key][index][0];

    const value = new (standardErrors[decodePointer(store, dataArray[0])] || Error)(decodePointer(store, dataArray[1]));
    value.stack = decodePointer(store, dataArray[2]);

    return value;
});

var genArrayBuffer = (systemName, type) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: (store, dataItem) => {
            dataItem._indices = Array.from(new Uint8Array(dataItem._reference));
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

var ArrayBufferType = tryCreateType(typeof ArrayBuffer, () => {
    return genArrayBuffer('ArrayBuffer', ArrayBuffer);
});

var SharedArrayBufferType = tryCreateType(typeof SharedArrayBuffer, () => {
    return genArrayBuffer('SharedArrayBuffer', SharedArrayBuffer);
});

var genTypedArray = (systemName, type) => {
    return genArrayLike(systemName, (store, key, index) => {
        return new type(store._encoded[key][index][0].length);
    });
};

var Int8ArrayType = tryCreateType(typeof Int8Array, () => {
    return genTypedArray('Int8Array', Int8Array);
});

var Uint8ArrayType = tryCreateType(typeof Uint8Array, () => {
    return genTypedArray('Uint8Array', Uint8Array);
});

var Uint8ClampedArrayType = tryCreateType(typeof Uint8ClampedArray, () => {
    return genTypedArray('Uint8ClampedArray', Uint8ClampedArray);
});

var Int16ArrayType = tryCreateType(typeof Int16Array, () => {
    return genTypedArray('Int16Array', Int16Array);
});

var Uint16ArrayType = tryCreateType(typeof Uint16Array, () => {
    return genTypedArray('Uint16Array', Uint16Array);
});

var Int32ArrayType = tryCreateType(typeof Int32Array, () => {
    return genTypedArray('Int32Array', Int32Array);
});

var Uint32ArrayType = tryCreateType(typeof Uint32Array, () => {
    return genTypedArray('Uint32Array', Uint32Array);
});

var Float32ArrayType = tryCreateType(typeof Float32Array, () => {
    return genTypedArray('Float32Array', Float32Array);
});

var Float64ArrayType = tryCreateType(typeof Float64Array, () => {
    return genTypedArray('Float64Array', Float64Array);
});

var genSetLike = (systemName, type, encodeSubValue, buildSubPointers) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: (store, dataItem) => {
            return [
                Array.from(dataItem._reference).map((subValue) => {
                    return encodeSubValue(store, subValue);
                }),
            ];
        },
        _generateReference: () => {
            return new type();
        },
        _build: (store, dataItem) => {
            dataItem._parts[0].forEach((subPointers) => {
                buildSubPointers(store, dataItem._reference, subPointers);
            });

            attachAttachmentsSkipFirst(store, dataItem);
        },
    };
};

var SetType = tryCreateType(typeof Set, () => {
    return genSetLike('Set', Set, (store, subValue) => {
        return encounterItem(store, subValue);
    }, (store, addTo, subPointer) => {
        addTo.add(getDecoded(store, subPointer));
    });
});

var MapType = tryCreateType(typeof Map, () => {
    return genSetLike('Map', Map, (store, subValue) => {
        return [encounterItem(store, subValue[0]), encounterItem(store, subValue[1])];
    }, (store, addTo, subPointers) => {
        addTo.set(getDecoded(store, subPointers[0]), getDecoded(store, subPointers[1]));
    });
});

/* istanbul ignore next */
var genBlobLike = (systemName, propertiesKeys, create) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
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

/* istanbul ignore next */
var BlobType = tryCreateType(typeof Blob, () => {
    return genBlobLike('Blob', ['type'], (store, buffer, dataArray) => {
        return new Blob(buffer, {
            type: decodePointer(store, dataArray[1]),
        });
    });
});

/* istanbul ignore next */
var FileType = tryCreateType(typeof File, () => {
    return genBlobLike('File', ['name', 'type', 'lastModified'], (store, buffer, dataArray) => {
        return new File(buffer, decodePointer(store, dataArray[1]), {
            type: decodePointer(store, dataArray[2]),
            lastModified: decodePointer(store, dataArray[3])
        });
    });
});

/* istanbul ignore next */
var BigIntType = tryCreateType(typeof BigInt, () => {
    return genPrimitive('BigInt', BigInt, (store, dataItem) => {
        return encounterItem(store, String(dataItem._reference));
    }, (store, key, index) => {
        return BigInt(decodePointer(store, store._encoded[key][index]));
    });
});

const types = {
    un: undefinedType,
    nl: nullType,
    na: NaNType,
    pI: InfinityType,
    nI: NegativeInfinityType,
    n0: Negative0Type,
    bt: trueType,
    bf: falseType,
    nm: NumberType, // ORDER MATTERS: General Number must come after special numbers NaN, -0, Infinity, and -Infinity
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
    BI: BigIntType,
};

const prepOutput = (store, root) => {
    // Having found all data structure contents, encode each value into the encoded output
    store._references.forEach((dataItem) => {
        // Encode the actual value
        store._output[dataItem._key][dataItem._index] = types[dataItem._key]._encodeValue(store, dataItem);

        // Encode any values attached to the value
        if (dataItem._attachments.length > 0) {
            store._output[dataItem._key][dataItem._index] = store._output[dataItem._key][dataItem._index].concat(dataItem._attachments.map((attachment) => {
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
        _onFinish: options.onFinish,
        _types: types,
        _references: new Map(), // Known References
        _explore: [], // Exploration queue
        _deferred: [], // Deferment List of dataItems to encode later, in callback form, such as blobs and files, which are non-synchronous by design
        _output: {},
    };

    const rootPointerKey = encounterItem(store, value);

    // Root value is simple, can skip main encoding steps
    if (types[rootPointerKey]) {
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

            throw new Error('Found deferred type, but no onFinish option provided.');
        }

        let deferredLength = store._deferred.length;

        const onCallback = () => {
            deferredLength -= 1;
            if (deferredLength === 0) {
                return prepOutput(store, rootPointerKey);
            }
        };

        store._deferred.forEach((dataItem) => {
            types[dataItem._key]._deferredEncode(store, dataItem, onCallback);
        });

        return;
    }

    // Normal output without deferment
    return prepOutput(store, rootPointerKey);
};

// Recursively look at the reference set for exploration values
// This handles both pair arrays and individual values
// This recursion is fine because it has a maximum depth of 3
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

    // If a simple pointer, an unknown pointer, or an already explored pointer, ignore
    if (types[pointer] || !types[p._key] || store._decoded[pointer] !== void 0) {
        return;
    }

    store._decoded[pointer] = {
        _key: p._key,
        _index: p._index,
        _pointer: pointer,
        _reference: void 0,
        _parts: store._encoded[p._key][p._index],
    };

    store._decoded[pointer]._reference = types[p._key]._generateReference(store, p._key, p._index);

    if (getSystemName(store._decoded[pointer]._parts) === 'Array') {
        exploreParts(store, store._decoded[pointer]._parts);
    }
};

var decode = (encoded, options) => {
    options = options || {};

    const store = {
        _safe: options.safeMode,
        _types: types,
        _encoded: encoded.reduce((accumulator, e) => {
            accumulator[e[0]] = e[1];
            return accumulator;
        }, {}),
        _decoded: {},
        _explore: [],
    };

    const rootPointerKey = store._encoded.r;

    // Simple pointer, return value
    if (types[rootPointerKey]) {
        return types[rootPointerKey]._value;
    }

    const rootP = extractPointer(rootPointerKey);

    // Unrecognized root type
    if (!types[rootP._key]) {
        if (store._safe) {
            return rootPointerKey;
        }

        throw new Error(`Cannot decode unrecognized pointer type "${rootP._key}".`);
    }

    // Explore through data structure
    store._explore.push(rootPointerKey);
    while (store._explore.length) {
        explorePointer(store, store._explore.shift());
    }

    // Having explored all of the data structure, fill out data and references
    Object.values(store._decoded).forEach((dataItem) => {
        types[dataItem._key]._build(store, dataItem);
    });

    return store._decoded[rootPointerKey]._reference;
};

var main = {
    encode: encode,
    decode: decode,
};

export default main;
