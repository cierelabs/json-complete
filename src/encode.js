const getAttachmentPairs = require('./utils/getAttachmentPairs.js');
const getPointerKey = require('./utils/getPointerKey.js');
const keysSimple = require('./utils/keysSimple.js');
const keysComposite = require('./utils/keysComposite.js');

const genEncodePointer = (data, value) => {
    const pointerKey = getPointerKey(value);
    data[pointerKey] = data[pointerKey] || [];
    const pointerIndex = data[pointerKey].length;

    return {
        k: pointerKey,
        i: pointerIndex,
        v: value,
        p: `${pointerKey}${pointerIndex}`,
    };
};

const tryGetExistingPointer = (data, value, pointerKey) => {
    // Simple PointerKeys are their own Pointers
    if (keysSimple[pointerKey]) {
        return pointerKey;
    }

    // Ensure the ref list exists
    data._.k[pointerKey] = data._.k[pointerKey] || [];

    // Try to find existing item matching the value
    const foundItem = data._.k[pointerKey].find((p) => {
        return p.v === value;
    });

    // If found, return its existing pointer
    return (foundItem || {}).p;
};

const encodePrimitive = (data, value) => {
    const p = genEncodePointer(data, value);
    data[p.k][p.i] = value;
    data._.k[p.k].push(p);
    return p.p;
};

const encodeContainer = (data, box, pairs) => {
    const p = genEncodePointer(data, box);

    // As a container type, it might already have been encountered, so we use the existing PointerIndex if available
    const existingPointer = tryGetExistingPointer(data, box, p.k);

    if (existingPointer) {
        // encodeContainer is never called on a Simple Pointer Key value, so there is no need to account for a missing index here
        p.i = parseInt(existingPointer.substring(2), 10);
        p.p = existingPointer;
    }
    else {
        data._.k[p.k].push(p);
    }

    data[p.k][p.i] = data[p.k][p.i] || [];
    data[p.k][p.i] = data[p.k][p.i].concat(pairs.map((pair, index) => {
        if (index === 0 && keysComposite[p.k]) {
            return pair;
        }

        if (pair.length === 1) {
            return [
                encodeValue(data, pair[0]),
            ];
        }

        return [
            encodeValue(data, pair[0]),
            encodeValue(data, pair[1]),
        ];
    }));

    return p.p;
};

const encodeStandardContainer = (data, value) => {
    return encodeContainer(data, value, getAttachmentPairs(value));
};

const encodeCompositeContainer = (data, value, encodedValue) => {
    return encodeContainer(data, value, [encodedValue].concat(getAttachmentPairs(value)))
};

const encodeWrappedObject = (data, value) => {
    return encodeCompositeContainer(data, value, encodeValue(data, value.valueOf()));
};

const encodeTypedArray = (data, value) => {
    const pairs = getAttachmentPairs(value).reduce((accumulator, pair) => {
        if (pair.length === 1) {
            accumulator[0].push(encodeValue(data, pair[0]));
        }
        else {
            accumulator[1].push(pair);
        }
        return accumulator;
    }, [[], []]);

    return encodeContainer(data, value, [pairs[0]].concat(pairs[1]));
};

/* istanbul ignore next */
const genBlobLikeEncoder = (properties) => {
    return (data, value) => {
        // Initial simple value is injected for now to later be replaced
        const encodedValueData = [void 0].concat(properties.map((property) => {
            return encodeValue(data, value[property]);
        }));

        const pointer = encodeContainer(data, value, [encodedValueData].concat(getAttachmentPairs(value)));

        // Because Blobs and Files cannot be read synchronously (and shouldn't, due to size), we have to defer conversion until later
        data._.b.push({
            k: getPointerKey(value),
            i: parseInt(pointer.substring(2), 10),
            p: pointer,
            v: value,
        });

        return pointer;
    };
};

const encodeValue = (data, value) => {
    const pointerKey = getPointerKey(value);

    const existingPointer = tryGetExistingPointer(data, value, pointerKey);

    // If found, return its existing pointer
    if (existingPointer) {
        return existingPointer;
    }

    // This newly encountered item should be encoded and stored, then return the created pointer
    // Container types will also add themselves to the exploreQueue for later evaluation
    return encoders[pointerKey](data, value);
};

const encoders = {
    'nm': encodePrimitive,
    'st': encodePrimitive,
    're': (data, value) => {
        return encodeCompositeContainer(data, value, [
            encodeValue(data, value.source),
            encodeValue(data, value.flags),
            encodeValue(data, value.lastIndex),
        ]);
    },
    'da': (data, value) => {
        return encodeCompositeContainer(data, value, encodeValue(data, value.getTime()));
    },
    'sy': (data, value) => {
        const p = genEncodePointer(data, value);

        const symbolStringKey = Symbol.keyFor(value);
        if (symbolStringKey !== void 0) {
            // For Registered Symbols, specify with 1 value and store the registered string value
            data[p.k][p.i] = [encodeValue(data, 1), encodeValue(data, symbolStringKey)];
        }
        else {
            const symbolString = String(value);
            // For unique Symbols, specify with 0 value and also store the optional identifying string
            data[p.k][p.i] = [encodeValue(data, 0), encodeValue(data, symbolString.substring(7, symbolString.length - 1))];
        }

        data._.k[p.k].push(p);
        return p.p;
    },
    'fu': (data, value) => {
        return encodeCompositeContainer(data, value, encodeValue(data, String(value)));
    },
    'er': (data, value) => {
        let type;

        if (value instanceof EvalError) {
            type = 'EvalError';
        }
        else if (value instanceof RangeError) {
            type = 'RangeError';
        }
        else if (value instanceof ReferenceError) {
            type = 'ReferenceError';
        }
        else if (value instanceof SyntaxError) {
            type = 'SyntaxError';
        }
        else if (value instanceof TypeError) {
            type = 'TypeError';
        }
        else if (value instanceof URIError) {
            type = 'URIError';
        }
        else {
            type = 'Error';
        }

        return encodeCompositeContainer(data, value, [
            encodeValue(data, type),
            encodeValue(data, value.message),
            encodeValue(data, value.stack),
        ]);
    },
    'ag': encodeStandardContainer,
    'ar': encodeStandardContainer,
    'ob': encodeStandardContainer,
    'BO': encodeWrappedObject,
    'NM': encodeWrappedObject,
    'ST': encodeWrappedObject,
    'I1': encodeTypedArray,
    'U1': encodeTypedArray,
    'C1': encodeTypedArray,
    'I2': encodeTypedArray,
    'U2': encodeTypedArray,
    'I3': encodeTypedArray,
    'U3': encodeTypedArray,
    'F3': encodeTypedArray,
    'F4': encodeTypedArray,
    'Se': (data, value) => {
        const encodedValueData = [];
        value.forEach((part) => {
            encodedValueData.push(encodeValue(data, part));
        });

        return encodeCompositeContainer(data, value, encodedValueData);
    },
    'Ma': (data, value) => {
        const encodedValueData = [];
        value.forEach((value, key) => {
            encodedValueData.push([encodeValue(data, key), encodeValue(data, value)]);
        });

        return encodeCompositeContainer(data, value, encodedValueData);
    },
    'Bl': genBlobLikeEncoder(['type']),
    'Fi': genBlobLikeEncoder(['name', 'type', 'lastModified']),
};

const prepOutput = (data) => {
    // Remove encoding data no longer needed
    delete data._;

    // Convert data object to a simple array of pairs
    return getAttachmentPairs(data);
};

module.exports = (value, onFinish) => {
    const data = {
        _: {
            q: [], // Exploration Queue
            k: {}, // Known References
            b: [], // Blob and File Deferment List
        },
    };

    // Initialize data from the top-most value
    data.r = encodeValue(data, value);

    // While there are still references to explore, go through them
    while (data._.q.length > 0) {
        encodeValue(data, data._.q.shift().v);
    }

    // If we have to handle Blob or File types
    /* istanbul ignore next */
    if (data._.b.length > 0) {
        if (typeof onFinish !== 'function') {
            throw 'Callback function required when encoding Blob or File objects.';
        }

        let toParseCount = data._.b.length;
        data._.b.forEach((p) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                data[p.k][p.i][0][0] = encodeValue(data, new Uint8Array(reader.result));

                toParseCount -= 1;
                if (toParseCount === 0) {
                    onFinish(prepOutput(data));
                }
            });

            reader.readAsArrayBuffer(p.v);
        });

        return;
    }

    // If used in a callback form, call the callback
    if (typeof onFinish === 'function') {
        onFinish(prepOutput(data));
        return;
    }

    // Otherwise, return directly
    return prepOutput(data);
};
