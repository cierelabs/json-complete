var getSystemName = (v) => {
    return Object.prototype.toString.call(v).slice(8, -1);
};

var isSimple = (types, pointerKey) => {
    return types[pointerKey] && !types[pointerKey]._encodeValue;
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
        const symbolStringMatches = String(symbol).match(/^Symbol\(Symbol\.([^\)]*)\)$/);
        return symbolStringMatches === null || symbolStringMatches.length !== 2 || Symbol[symbolStringMatches[1]] !== symbol;
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

const getPointerKey = (types, value, isSafeMode) => {
    const pointerKey = Object.keys(types).find((typeKey) => {
        return types[typeKey]._identify(value);
    });

    if (!pointerKey) {
        if (isSafeMode) {
            // In safe mode, Unsupported types are stored as plain, empty objects, so that they retain their referencial integrity, but can still handle attachments
            return 'ob';
        }

        throw(new Error(`Unsupported type "${getSystemName(value)}". Encoding halted.`))
    }

    return pointerKey;
};

const prepExplorableItem = (store, item) => {
    if (store._references.get(item) === void 0 && !isSimple(store._types, getPointerKey(store._types, item, store._safe))) {
        store._explore.push(item);
    }
};

var encounterItem = (store, item) => {
    const pointerKey = getPointerKey(store._types, item, store._safe);

    if (isSimple(store._types, pointerKey)) {
        return pointerKey;
    }

    const existingDataItem = store._references.get(item);

    if (existingDataItem !== void 0) {
        return existingDataItem._pointer;
    }

    // Ensure location exists
    store[pointerKey] = store[pointerKey] || [];

    // Add temp value to update the location
    store[pointerKey].push(void 0);

    const pointerIndex = store[pointerKey].length - 1;

    const dataItem = {
        _key: pointerKey,
        _index: pointerIndex,
        _pointer: pointerKey + pointerIndex,
        _value: item,
        _indices: [],
        _attachments: [],
    };

    // Store the reference uniquely along with location information
    store._references.set(item, dataItem);

    /* istanbul ignore next */
    if (store._types[pointerKey]._deferredEncode) {
        store._deferred.push(dataItem);
    }

    const attached = getAttachments(item);
    let indices = attached._indices;
    const attachments = attached._attachments;

    // Object-wrapped Strings will include indices for each character in the string
    if (store._types[pointerKey]._ignoreIndices) {
        indices = [];
    }

    // Save the known attachments for the next phase so we do not have to reacquire them
    dataItem._indices = indices;
    dataItem._attachments = attachments;

    // Prep sub-items to be explored later
    indices.forEach((s) => {
        prepExplorableItem(store, s);
    });
    attachments.forEach((s) => {
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
        _build: () => {
            return value;
        },
    };
};

var undefinedType = genSimpleEqualityType(void 0);

var nullType = genSimpleEqualityType(null);

var NaNType = {
    _identify: (v) => {
        return v !== v;
    },
    _build: () => {
        return NaN;
    },
};

var InfinityType = genSimpleEqualityType(Infinity);

var NegativeInfinityType = genSimpleEqualityType(-Infinity);

var Negative0Type = {
    _identify: (v) => {
        return v === 0 && (1 / v) === -Infinity;
    },
    _build: () => {
        return -0;
    },
};

var trueType = genSimpleEqualityType(true);

var falseType = genSimpleEqualityType(false);

var genPrimitive = (systemName, type) => {
    return {
        _identify: (v) => {
            return getSystemName(v) === systemName && !(v instanceof type);
        },
        _encodeValue: (_, dataItem) => {
            return dataItem._value;
        },
        _generateReference: (store, key, index) => {
            return store._encoded[key][index];
        },
        _build: (_, dataItem) => {
            return dataItem._value;
        },
    };
};

var NumberType = genPrimitive('Number', Number);

var StringType = genPrimitive('String', String);

var extractPointer = (pointer) => {
    return {
        _key: pointer.substring(0, 2),
        _index: parseInt(pointer.substring(2), 10),
    };
};

// This is the function for getting pointer values in the generateReference functions
var decodePointer = (store, pointer) => {
    if (isSimple(store._types, pointer)) {
        return store._types[pointer]._build();
    }

    const p = extractPointer(pointer);

    return store._types[p._key]._generateReference(store, p._key, p._index);
};

// This is the function for getting pointer references in the build functions
var getDecoded = (store, pointer) => {
    if (isSimple(store._types, pointer)) {
        return store._types[pointer]._build();
    }

    const p = extractPointer(pointer);

    if (!store._types[p._key]) {
        return pointer;
    }

    return store._decoded[pointer]._value;
};

var attachAttachments = (store, dataItem, attachments) => {
    attachments.forEach((pair) => {
        dataItem._value[getDecoded(store, pair[0])] = getDecoded(store, pair[1]);
    });
};

var attachAttachmentsSkipFirst = (store, dataItem) => {
    attachAttachments(store, dataItem, dataItem._parts.slice(1));
};

var genDoesMatchSystemName = (systemName) => {
    return (v) => {
        return getSystemName(v) === systemName;
    };
};

var genAttachableValueObject = (systemName, encodeValue, generateReference) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: encodeValue,
        _generateReference: generateReference,
        _build: attachAttachmentsSkipFirst,
    };
};

// Technically, Symbols doesn't allow attachments, so using it as if it is a standard attachable object is a no-op
var SymbolType = genAttachableValueObject('Symbol', (store, dataItem) => {
    const symbolStringKey = Symbol.keyFor(dataItem._value);
    const isRegistered = symbolStringKey !== void 0;

    return [
        // For Registered Symbols, specify with 1 value and store the registered string value
        // For unique Symbols, specify with 0 value and also store the optional identifying string
        encounterItem(store, isRegistered ? 1 : 0),
        encounterItem(store, isRegistered ? symbolStringKey : String(dataItem._value).slice(7, -1)),
    ];
}, (store, key, index) => {
    const encodedValue = store._encoded[key][index];
    const identifierString = decodePointer(store, encodedValue[1]);

    return decodePointer(store, encodedValue[0]) === 1 ? Symbol.for(identifierString) : Symbol(identifierString);
});

var arrayLikeEncodeValue = (store, dataItem) => {
    return [
        dataItem._indices.map((subValue) => {
            return encounterItem(store, subValue);
        }),
    ];
};

var genArrayLike = (systemName, generateReference) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: arrayLikeEncodeValue,
        _generateReference: generateReference,
        _build: (store, dataItem) => {
            dataItem._parts[0].forEach((pointer, index) => {
                dataItem._value[index] = getDecoded(store, pointer);
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
    }).apply(null, Array.from({
        length: store._encoded[key][index][0].length,
    }, () => {}));
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
                encounterItem(store, dataItem._value.valueOf()),
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

var RegExpType = genAttachableValueObject('RegExp', (store, dataItem) => {
    return [
        [
            encounterItem(store, dataItem._value.source),
            encounterItem(store, dataItem._value.flags),
            encounterItem(store, dataItem._value.lastIndex),
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
            encounterItem(store, standardErrors[dataItem._value.name] ? dataItem._value.name : 'Error'),
            encounterItem(store, dataItem._value.message),
            encounterItem(store, dataItem._value.stack),
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
            dataItem._indices = Array.from(new Uint8Array(dataItem._value));
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

var ArrayBufferType = genArrayBuffer('ArrayBuffer', ArrayBuffer);

var SharedArrayBufferType = genArrayBuffer('SharedArrayBuffer', SharedArrayBuffer);

var genTypedArray = (systemName, type) => {
    return genArrayLike(systemName, (store, key, index) => {
        return new type(store._encoded[key][index][0].length);
    });
};

var Int8ArrayType = genTypedArray('Int8Array', Int8Array);

var Uint8ArrayType = genTypedArray('Uint8Array', Uint8Array);

var Uint8ClampedArrayType = genTypedArray('Uint8ClampedArray', Uint8ClampedArray);

var Int16ArrayType = genTypedArray('Int16Array', Int16Array);

var Uint16ArrayType = genTypedArray('Uint16Array', Uint16Array);

var Int32ArrayType = genTypedArray('Int32Array', Int32Array);

var Uint32ArrayType = genTypedArray('Uint32Array', Uint32Array);

var Float32ArrayType = genTypedArray('Float32Array', Float32Array);

var Float64ArrayType = genTypedArray('Float64Array', Float64Array);

var genSetLike = (systemName, type, encodeSubValue, buildSubPointers) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: (store, dataItem) => {
            return [
                Array.from(dataItem._value).map((subValue) => {
                    return encodeSubValue(store, subValue);
                }),
            ];
        },
        _generateReference: () => {
            return new type();
        },
        _build: (store, dataItem) => {
            dataItem._parts[0].forEach((subPointers) => {
                buildSubPointers(store, dataItem._value, subPointers);
            });

            attachAttachmentsSkipFirst(store, dataItem);
        },
    };
};

var SetType = genSetLike('Set', Set, (store, subValue) => {
    return encounterItem(store, subValue);
}, (store, addTo, subPointer) => {
    addTo.add(getDecoded(store, subPointer));
});

var MapType = genSetLike('Map', Map, (store, subValue) => {
    return [encounterItem(store, subValue[0]), encounterItem(store, subValue[1])];
}, (store, addTo, subPointers) => {
    addTo.set(getDecoded(store, subPointers[0]), getDecoded(store, subPointers[1]));
});

/* istanbul ignore next */
var genBlobLike = (systemName, propertiesKeys, create) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: (store, dataItem) => {
            return [
                [new Uint8Array(0)].concat(propertiesKeys.map((property) => {
                    return encounterItem(store, dataItem._value[property]);
                })),
            ];
        },
        _deferredEncode: (store, dataItem, callback) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                const typedArray = new Uint8Array(reader.result);
                const typedArrayPointer = encounterItem(store, typedArray);

                const typedArrayP = extractPointer(typedArrayPointer);

                store[typedArrayP._key][typedArrayP._index] = [
                    Array.from(typedArray).map((subItem) => {
                        const numberPointer = encounterItem(store, subItem);
                        const numberP = extractPointer(numberPointer);
                        store[numberP._key][numberP._index] = subItem;
                        return numberPointer;
                    }),
                ];
                store[dataItem._key][dataItem._index][0][0] = typedArrayPointer;
                callback();
            });
            reader.readAsArrayBuffer(dataItem._value);
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
var BlobType = genBlobLike('Blob', ['type'], (store, buffer, dataArray) => {
    return new Blob(buffer, {
        type: decodePointer(store, dataArray[1]),
    });
});

/* istanbul ignore next */
var FileType = genBlobLike('File', ['name', 'type', 'lastModified'], (store, buffer, dataArray) => {
    return new File(buffer, decodePointer(store, dataArray[1]), {
        type: decodePointer(store, dataArray[2]),
        lastModified: decodePointer(store, dataArray[3])
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
};

const prepOutput = (store, root) => {
    const onFinish = getSystemName(store._onFinish) === 'Function' ? store._onFinish : void 0;

    store = Object.keys(store).reduce((accumulator, key) => {
        if (key[0] !== '_') {
            accumulator[key] = store[key];
        }

        return accumulator;
    }, {});

    store.r = root;
    store.v = '1.0.0';

    const output = Object.keys(store).map((key) => {
        return [
            key,
            store[key],
        ];
    });

    if (onFinish) {
        onFinish(output);
        return;
    }

    return output;
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
    };

    const rootPointerKey = encounterItem(store, value);

    // Root value is simple, can skip main encoding steps
    if (isSimple(types, rootPointerKey)) {
        return prepOutput(store, rootPointerKey);
    }

    store._explore.push(value);

    while (store._explore.length) {
        encounterItem(store, store._explore.shift());
    }

    store._references.forEach((dataItem) => {
        store[dataItem._key][dataItem._index] = types[dataItem._key]._encodeValue(store, dataItem);

        if (dataItem._attachments.length > 0) {
            store[dataItem._key][dataItem._index] = store[dataItem._key][dataItem._index].concat(dataItem._attachments.map((attachment) => {
                return [
                    encounterItem(store, attachment[0]),
                    encounterItem(store, attachment[1]),
                ];
            }));
        }
    });

    /* istanbul ignore next */
    if (store._deferred.length > 0) {
        // Handle Blob or File type encoding
        if (getSystemName(store._onFinish) !== 'Function') {
            if (store._safe) {
                // In safe mode, if the onFinish function is not provided, File and Blob object data will be discarded as empty
                return prepOutput(store, store._references.get(value)._pointer)
            }

            throw new Error('Encoded value contained a deferred type (File and Blob), but no `options.onFinish` function provided.');
        }

        let deferredLength = store._deferred.length;

        const onCallback = () => {
            deferredLength -= 1;
            if (deferredLength === 0) {
                return prepOutput(store, store._references.get(value)._pointer);
            }
        };

        store._deferred.forEach((dataItem) => {
            types[dataItem._key]._deferredEncode(store, dataItem, onCallback);
        });

        return;
    }

    // Normal output without deferment
    return prepOutput(store, store._references.get(value)._pointer);
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

    if (!types[p._key] || store._decoded[pointer] !== void 0 || isSimple(types, p._key)) {
        return;
    }

    const dataItem = {
        _key: p._key,
        _index: p._index,
        _pointer: pointer,
        _value: void 0,
        _parts: [],
    };

    store._decoded[pointer] = dataItem;

    dataItem._value = types[p._key]._generateReference(store, dataItem._key, dataItem._index);
    dataItem._parts = store._encoded[dataItem._key][dataItem._index];

    if (getSystemName(dataItem._parts) === 'Array') {
        exploreParts(store, dataItem._parts);
    }
};

var decode = (encoded) => {
    const store = {
        _types: types,
        _encoded: encoded.reduce((accumulator, e) => {
            accumulator[e[0]] = e[1];
            return accumulator;
        }, {}),
        _decoded: {},
        _explore: [],
    };

    const rootP = extractPointer(store._encoded.r);

    // Unrecognized root type, return pointer
    if (!types[rootP._key]) {
        return store._encoded.r;
    }

    if (isSimple(types, rootP._key)) {
        return types[rootP._key]._build();
    }

    store._explore.push(store._encoded.r);
    while (store._explore.length) {
        explorePointer(store, store._explore.shift());
    }

    Object.values(store._decoded).forEach((dataItem) => {
        types[dataItem._key]._build(store, dataItem);
    });

    return store._decoded[store._encoded.r]._value;
};

var main = {
    encode: encode,
    decode: decode,
};

export default main;
