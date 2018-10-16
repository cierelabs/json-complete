const genEncodePointer = require('./utils/genEncodePointer.js');
const getAttachmentPairs = require('./utils/getAttachmentPairs.js');
const getPointerKey = require('./utils/getPointerKey.js');
const isContainerPointerKey = require('./utils/isContainerPointerKey.js');
const isSimplePointerKey = require('./utils/isSimplePointerKey.js');
const isCompositePointerKey = require('./utils/isCompositePointerKey.js');

const extractIndexFromPointer = (pointer) => {
    return parseInt(pointer.substring(2), 10);
};

const tryGetExistingPointer = (data, value, pointerKey) => {
    // Simple PointerKeys are their own Pointers
    if (isSimplePointerKey(pointerKey)) {
        return pointerKey;
    }

    // Ensure the ref list exists
    data.k[pointerKey] = data.k[pointerKey] || [];

    // Try to find existing item matching the value
    const foundItem = data.k[pointerKey].find((p) => {
        return p.v === value;
    });

    // If found, return its existing pointer
    return (foundItem || {}).p;
};

const encodePrimitive = (data, value) => {
    const p = genEncodePointer(data, value);
    data[p.k][p.i] = value;
    data.k[p.k].push(p);
    return p.p;
};

const genEncodedPart = (data, value) => {
    const pointerKey = getPointerKey(value);

    // Already know of this value, so use its existing Pointer
    const existingPointer = tryGetExistingPointer(data, value, pointerKey);
    if (existingPointer) {
        return existingPointer;
    }

    // Unknown and not a container type: encode the encoded pair into container
    if (!isContainerPointerKey(pointerKey)) {
        return encodeValue(data, value);
    }

    // Found a new Container, ensure it is prepped for exploration
    const p = genEncodePointer(data, value);

    data[p.k][p.i] = [];

    // Only allow one-level-deep container exploration by using the exploreQueue, otherwise circular references can cause infinite loops
    data.k[p.k].push(p);
    data.q.push(p);

    return p.p;
};

const encodeContainer = (data, box, pairs) => {
    const p = genEncodePointer(data, box);

    // As a container type, it might already have been encountered, so we use the existing PointerIndex if available
    const existingPointer = tryGetExistingPointer(data, box, p.k);

    if (existingPointer) {
        // encodeContainer is never called on a Simple Pointer Key value, so there is no need to account for a missing index here
        p.i = extractIndexFromPointer(existingPointer);
        p.p = existingPointer;
    }
    else {
        data.k[p.k].push(p);
    }

    data[p.k][p.i] = data[p.k][p.i] || [];
    const container = data[p.k][p.i];

    if (isCompositePointerKey(p.k)) {
        container.push(pairs[0]);
        pairs = pairs.slice(1);
    }

    // Encode each part of the Container
    pairs.forEach((pair) => {
        if (pair.length === 1) {
            container.push([
                genEncodedPart(data, pair[0]),
            ]);
            return;
        }

        container.push([
            genEncodedPart(data, pair[0]),
            genEncodedPart(data, pair[1]),
        ]);
    });

    return p.p;
};

const encodeValue = (data, value) => {
    const pointerKey = getPointerKey(value);

    // Containers values need to handle their own existing Pointer handling
    if (!isContainerPointerKey(pointerKey)) {
        const existingPointer = tryGetExistingPointer(data, value, pointerKey);

        // If found, return its existing pointer
        if (existingPointer) {
            return existingPointer;
        }
    }

    // This newly encountered item should be encoded and stored, then return the created pointer
    // Container types will also add themselves to the exploreQueue for later evaluation
    return encoders[pointerKey](data, value);
};

const encodeStandardContainer = (data, value) => {
    return encodeContainer(data, value, getAttachmentPairs(value));
};

const encodeWrappedObject = (data, value) => {
    const encodedValue = encodeValue(data, value.valueOf());
    return encodeContainer(data, value, [encodedValue].concat(getAttachmentPairs(value)));
};

const encodeTypedArray = (data, value) => {
    const attachments = getAttachmentPairs(value);
    const indices = [];
    const otherPairs = [];

    attachments.forEach((pair) => {
        if (pair.length === 1) {
            indices.push(encodeValue(data, pair[0]));
            return;
        }

        otherPairs.push(pair);
    });

    return encodeContainer(data, value, [indices].concat(otherPairs));
};

/* istanbul ignore next */
const genBlobLikeEncoder = (defermentListKey, properties) => {
    return (data, value) => {
        // Initial simple value is injected for now to later be replaced
        const source = [void 0];
        properties.forEach((property) => {
            source.push(encodeValue(data, value[property]));
        });

        const pointer = encodeContainer(data, value, [source].concat(getAttachmentPairs(value)));

        // Because Blobs and Files cannot be read synchronously (and shouldn't, due to size), we have to defer conversion until later
        data[defermentListKey].push({
            k: getPointerKey(value),
            i: extractIndexFromPointer(pointer),
            p: pointer,
            v: value,
        });

        return pointer;
    };
};

const encoders = {
    'nm': encodePrimitive,
    'st': encodePrimitive,
    're': (data, value) => {
        const encodedValueData = [
            encodeValue(data, value.source),
            encodeValue(data, value.flags),
            encodeValue(data, value.lastIndex),
        ];

        return encodeContainer(data, value, [encodedValueData].concat(getAttachmentPairs(value)));
    },
    'da': (data, value) => {
        let encodedValueData = value.getTime();

        // Invalid Dates return NaN from getTime()
        if (encodedValueData !== encodedValueData) {
            // Encode as non-number value, which will generate an Invalid Date when converted
            encodedValueData = '';
        }

        encodedValueData = encodeValue(data, encodedValueData);

        return encodeContainer(data, value, [encodedValueData].concat(getAttachmentPairs(value)));
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

        data.k[p.k].push(p);
        return p.p;
    },
    'fu': (data, value) => {
        const encodedValueData = encodeValue(data, String(value));
        return encodeContainer(data, value, [encodedValueData].concat(getAttachmentPairs(value)));
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

        const encodedValue = [
            encodeValue(data, type),
            encodeValue(data, value.message),
            encodeValue(data, value.stack),
        ];

        return encodeContainer(data, value, [encodedValue].concat(getAttachmentPairs(value)));
    },
    'ob': encodeStandardContainer,
    'ar': encodeStandardContainer,
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
        const encodedValue = [];
        value.forEach((part) => {
            encodedValue.push(genEncodedPart(data, part));
        });

        return encodeContainer(data, value, [encodedValue].concat(getAttachmentPairs(value)));
    },
    'Ma': (data, value) => {
        const encodedValue = [];
        value.forEach((value, key) => {
            encodedValue.push([genEncodedPart(data, key), genEncodedPart(data, value)]);
        });

        return encodeContainer(data, value, [encodedValue].concat(getAttachmentPairs(value)));
    },
    'Bl': genBlobLikeEncoder('b', ['type']),
    'Fi': genBlobLikeEncoder('f', ['name', 'type', 'lastModified']),
};

const prepOutput = (data) => {
    // Remove encoding data no longer needed
    delete data.q;
    delete data.k;
    delete data.b;
    delete data.f;

    // Convert data object to a simple array of pairs
    return getAttachmentPairs(data);
};

module.exports = (value, onFinish) => {
    const data = {
        q: [], // Exploration Queue
        k: {}, // Known References
        b: [], // Blob Deferment List
        f: [], // File Deferment List
    };

    // Initialize data from the top-most value
    data.r = encodeValue(data, value);

    // While there are still references to explore, go through them
    while (data.q.length > 0) {
        encodeValue(data, data.q.shift().v);
    }

    // If we have to handle Blob or File types
    /* istanbul ignore next */
    if (data.b.length > 0 || data.f.length > 0) {
        if (typeof onFinish !== 'function') {
            throw `The value being encoded contains a reference to a ${data.b.length > 0 ? 'Blob' : 'File'} object, which must be handled asynchronously. However, no callback function was provided.`;
        }

        let toParseCount = data.b.length + data.f.length;
        const onFinishParse = () => {
            toParseCount -= 1;
            if (toParseCount === 0) {
                onFinish(prepOutput(data));
            }
        };

        const encodeBlobLikeData = (p) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                data[p.k][p.i][0][0] = encodeValue(data, new Uint8Array(reader.result));
                onFinishParse();
            });

            reader.readAsArrayBuffer(p.v);
        };

        data.b.forEach(encodeBlobLikeData);
        data.f.forEach(encodeBlobLikeData);

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
