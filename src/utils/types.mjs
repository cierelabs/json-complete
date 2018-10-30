import encounterItem from '/src/utils/encounterItem.mjs';
import extractIndex from '/src/utils/extractIndex.mjs';
import extractKey from '/src/utils/extractKey.mjs';
import isSimple from '/src/utils/isSimple.mjs';
import standardErrors from '/src/utils/standardErrors.mjs';

const extractPointer = (pointer) => {
    return {
        key: extractKey(pointer),
        index: extractIndex(pointer),
    };
};

const getDataItemValue = (store, dataItem) => {
    return dataItem.value;
};

const arrayLikeEncodeValue = (store, dataItem) => {
    return [
        dataItem.indices.map((subValue) => {
            return encounterItem(store, subValue);
        }),
    ];
};

const arrayBufferEncodeValue = (store, dataItem) => {
    dataItem.indices = Array.from(new Uint8Array(dataItem.value));
    return arrayLikeEncodeValue(store, dataItem);
};

const arrayLikeBuild = (store, dataItem) => {
    dataItem.parts[0].forEach((pointer, index) => {
        dataItem.value[index] = getDecoded(store, pointer);
    });

    attachAttachmentsSkipFirst(store, dataItem);
};

const objectWrappedEncodeValue = (store, dataItem) => {
    return [
        [
            encounterItem(store, dataItem.value.valueOf()),
        ],
    ];
};

const attachAttachments = (store, dataItem, attachments) => {
    attachments.forEach((pair) => {
        dataItem.value[getDecoded(store, pair[0])] = getDecoded(store, pair[1]);
    });
};

const attachAttachmentsSkipFirst = (store, dataItem) => {
    attachAttachments(store, dataItem, dataItem.parts.slice(1));
};

// This is the function for getting pointer values in the generateReference functions
const decodePointer = (store, pointer) => {
    if (isSimple(pointer)) {
        return types[pointer].build();
    }

    const p = extractPointer(pointer);

    return types[p.key].generateReference(store, p.key, p.index);
};

// This is the function for getting pointer references in the build functions
const getDecoded = (store, pointer) => {
    const pointerKey = extractKey(pointer);

    if (!types[pointerKey]) {
        return pointer;
    }

    if (isSimple(pointerKey)) {
        return types[pointerKey].build();
    }

    return store.decoded[pointer].value;
};

const genSingleValueGenerateReference = (type) => {
    return (store, key, index) => {
        return new type(decodePointer(store, store.encoded[key][index][0][0]));
    }
};

const genArrayBufferGenerateReference = (type) => {
    return (store, key, index) => {
        const encodedValues = store.encoded[key][index][0];
        const buffer = new type(encodedValues.length);
        const view = new Uint8Array(buffer);
        encodedValues.forEach((pointer, index) => {
            view[index] = decodePointer(store, pointer);
        });
        return buffer;
    };
};

const genTypeArrayGenerateReference = (type) => {
    return (store, key, index) => {
        return new type(store.encoded[key][index][0].length);
    };
};

/* istanbul ignore next */
const genBlobLikeEncodeValue = (properties) => {
    return (store, dataItem) => {
        return [
            [void 0].concat(properties.map((property) => {
                return encounterItem(store, dataItem.value[property]);
            })),
        ]
    };
};

/* istanbul ignore next */
const blobLikeDeferredEncode = (store, dataItem, callback) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
        const typedArray = new Uint8Array(reader.result);
        const typedArrayPointer = encounterItem(store, typedArray);

        const typedArrayP = extractPointer(typedArrayPointer);

        store[typedArrayP.key][typedArrayP.index] = [
            Array.from(typedArray).map((subItem) => {
                const numberPointer = encounterItem(store, subItem);
                const numberP = extractPointer(numberPointer);
                if (store[numberP.key][numberP.index] === void 0) {
                    store[numberP.key][numberP.index] = subItem;
                }
                return numberPointer;
            }),
        ];
        store[dataItem.key][dataItem.index][0][0] = typedArrayPointer;
        callback();
    });
    reader.readAsArrayBuffer(dataItem.value);
};

/* istanbul ignore next */
const blobGenerateReference = (store, key, index) => {
    const dataArray = store.encoded[key][index][0];
    const p = extractPointer(dataArray[0]);

    return new Blob([new Uint8Array(store.encoded[p.key][p.index][0].map((pointer) => {
        return decodePointer(store, pointer);
    }))], {
        type: decodePointer(store, dataArray[1]),
    });
};

/* istanbul ignore next */
const fileGenerateReference = (store, key, index) => {
    const dataArray = store.encoded[key][index][0];
    const p = extractPointer(dataArray[0]);

    return new File([new Uint8Array(store.encoded[p.key][p.index][0].map((pointer) => {
        return decodePointer(store, pointer);
    }))], decodePointer(store, dataArray[1]), {
        type: decodePointer(store, dataArray[2]),
        lastModified: decodePointer(store, dataArray[3])
    });
};

const types = {
    un: {
        // undefined
        build: () => {
            return undefined;
        },
    },
    nl: {
        // null
        build: () => {
            return null;
        },
    },
    na: {
        // NaN
        build: () => {
            return NaN;
        },
    },
    '-i': {
        // -Infinity
        build: () => {
            return -Infinity;
        },
    },
    '+i': {
        // Infinity
        build: () => {
            return Infinity;
        },
    },
    n0: {
        // -0
        build: () => {
            return -0;
        },
    },
    bt: {
        // true
        build: () => {
            return true;
        },
    },
    bf: {
        // false
        build: () => {
            return false;
        },
    },
    nm: {
        // Number
        encodeValue: getDataItemValue,
        generateReference: (store, key, index) => {
            return store.encoded[key][index];
        },
        build: getDataItemValue,
    },
    st: {
        // String
        encodeValue: getDataItemValue,
        generateReference: (store, key, index) => {
            return store.encoded[key][index];
        },
        build: getDataItemValue,
    },
    sy: {
        // Symbol
        encodeValue: (store, dataItem) => {
            const symbolStringKey = Symbol.keyFor(dataItem.value);
            const isRegistered = symbolStringKey !== void 0;

            return [
                // For Registered Symbols, specify with 1 value and store the registered string value
                encounterItem(store, isRegistered ? 1 : 0),
                // For unique Symbols, specify with 0 value and also store the optional identifying string
                encounterItem(store, isRegistered ? symbolStringKey : String(dataItem.value).replace(/^Symbol\(|\)$/g, '')),
            ];
        },
        generateReference: (store, key, index) => {
            const encodedValue = store.encoded[key][index];
            const typeNumber = decodePointer(store, encodedValue[0]);
            const identifierString = decodePointer(store, encodedValue[1]);

            return typeNumber === 1 ? Symbol.for(identifierString) : Symbol(identifierString);
        },
        build: getDataItemValue,
    },
    ar: {
        // Array
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: () => {
            return [];
        },
        build: arrayLikeBuild,
    },
    ag: {
        // Arguments
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: (store, key, index) => {
            return (function() {
                return arguments;
            }).apply(null, Array.from({
                length: store.encoded[key][index][0].length,
            }, () => {}));
        },
        build: arrayLikeBuild,
    },
    ob: {
        // Object
        attachable: 1,
        encodeValue: () => {
            return [];
        },
        generateReference: () => {
            return {};
        },
        build: (store, dataItem) => {
            attachAttachments(store, dataItem, dataItem.parts);
        },
    },
    BO: {
        // Object-wrapped Boolean
        attachable: 1,
        ignoreIndices: 1,
        encodeValue: objectWrappedEncodeValue,
        generateReference: genSingleValueGenerateReference(Boolean),
        build: attachAttachmentsSkipFirst,
    },
    NM: {
        // Object-wrapped Number
        attachable: 1,
        encodeValue: objectWrappedEncodeValue,
        generateReference: genSingleValueGenerateReference(Number),
        build: attachAttachmentsSkipFirst,
    },
    ST: {
        // Object-wrapped String
        attachable: 1,
        encodeValue: objectWrappedEncodeValue,
        generateReference: genSingleValueGenerateReference(String),
        build: attachAttachmentsSkipFirst,
    },
    da: {
        // Date
        attachable: 1,
        encodeValue: (store, dataItem) => {
            return [
                [
                    encounterItem(store, dataItem.value.getTime()),
                ],
            ];
        },
        generateReference: genSingleValueGenerateReference(Date),
        build: attachAttachmentsSkipFirst,
    },
    re: {
        // RegExp
        attachable: 1,
        encodeValue: (store, dataItem) => {
            return [
                [
                    encounterItem(store, dataItem.value.source),
                    encounterItem(store, dataItem.value.flags),
                    encounterItem(store, dataItem.value.lastIndex),
                ],
            ];
        },
        generateReference: (store, key, index) => {
            const dataArray = store.encoded[key][index][0];
            const value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
            value.lastIndex = decodePointer(store, dataArray[2]);
            return value;
        },
        build: attachAttachmentsSkipFirst,
    },
    er: {
        // Error
        attachable: 1,
        encodeValue: (store, dataItem) => {
            return [
                [
                    encounterItem(store, standardErrors[dataItem.value.name] ? dataItem.value.name : 'Error'),
                    encounterItem(store, dataItem.value.message),
                    encounterItem(store, dataItem.value.stack),
                ],
            ];
        },
        generateReference: (store, key, index) => {
            const dataArray = store.encoded[key][index][0];

            const value = new (standardErrors[decodePointer(store, dataArray[0])] || Error)(decodePointer(store, dataArray[1]));
            value.stack = decodePointer(store, dataArray[2]);

            return value;
        },
        build: attachAttachmentsSkipFirst,
    },
    AB: {
        // ArrayBuffer
        attachable: 1,
        encodeValue: arrayBufferEncodeValue,
        generateReference: genArrayBufferGenerateReference(ArrayBuffer),
        build: attachAttachmentsSkipFirst,
    },
    SA: {
        // SharedArrayBuffer
        attachable: 1,
        encodeValue: arrayBufferEncodeValue,
        generateReference: genArrayBufferGenerateReference(SharedArrayBuffer),
        build: attachAttachmentsSkipFirst,
    },
    I1: {
        // Int8Array
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: genTypeArrayGenerateReference(Int8Array),
        build: arrayLikeBuild,
    },
    U1: {
        // Uint8Array
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: genTypeArrayGenerateReference(Uint8Array),
        build: arrayLikeBuild,
    },
    C1: {
        // Uint8ClampedArray
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: genTypeArrayGenerateReference(Uint8ClampedArray),
        build: arrayLikeBuild,
    },
    U2: {
        // Uint16Array
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: genTypeArrayGenerateReference(Uint16Array),
        build: arrayLikeBuild,
    },
    I2: {
        // Int16Array
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: genTypeArrayGenerateReference(Int16Array),
        build: arrayLikeBuild,
    },
    I3: {
        // Int32Array
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: genTypeArrayGenerateReference(Int32Array),
        build: arrayLikeBuild,
    },
    U3: {
        // Uint32Array
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: genTypeArrayGenerateReference(Uint32Array),
        build: arrayLikeBuild,
    },
    F3: {
        // Float32Array
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: genTypeArrayGenerateReference(Float32Array),
        build: arrayLikeBuild,
    },
    F4: {
        // Float64Array
        attachable: 1,
        encodeValue: arrayLikeEncodeValue,
        generateReference: genTypeArrayGenerateReference(Float64Array),
        build: arrayLikeBuild,
    },
    Se: {
        // Set
        attachable: 1,
        encodeValue: (store, dataItem) => {
            return [
                Array.from(dataItem.value).map((subValue) => {
                    return encounterItem(store, subValue);
                }),
            ];
        },
        generateReference: () => {
            return new Set();
        },
        build: (store, dataItem) => {
            dataItem.parts[0].forEach((pointer) => {
                dataItem.value.add(getDecoded(store, pointer));
            });

            attachAttachmentsSkipFirst(store, dataItem);
        },
    },
    Ma: {
        // Map
        attachable: 1,
        encodeValue: (store, dataItem) => {
            return [
                Array.from(dataItem.value).map((subValue) => {
                    return [encounterItem(store, subValue[0]), encounterItem(store, subValue[1])];
                }),
            ];
        },
        generateReference: () => {
            return new Map();
        },
        build: (store, dataItem) => {
            dataItem.parts[0].forEach((pairs) => {
                dataItem.value.set(getDecoded(store, pairs[0]), getDecoded(store, pairs[1]));
            });

            attachAttachmentsSkipFirst(store, dataItem);
        },
    },
    Bl: {
        // Blob
        attachable: 1,
        encodeValue: genBlobLikeEncodeValue(['type']),
        deferredEncode: blobLikeDeferredEncode,
        generateReference: blobGenerateReference,
        build: attachAttachmentsSkipFirst,
    },
    Fi: {
        // File
        attachable: 1,
        encodeValue: genBlobLikeEncodeValue(['name', 'type', 'lastModified']),
        deferredEncode: blobLikeDeferredEncode,
        generateReference: fileGenerateReference,
        build: attachAttachmentsSkipFirst,
    },
};

export default types;
