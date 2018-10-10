const genEncodePointer = require('./utils/genEncodePointer.js');
const getAttachmentPairs = require('./utils/getAttachmentPairs.js');
const getPointerKey = require('./utils/getPointerKey.js');
const isContainerPointerKey = require('./utils/isContainerPointerKey.js');
const isSimplePointerKey = require('./utils/isSimplePointerKey.js');

const booleanValueOf = Boolean.prototype.valueOf;
const concat = Array.prototype.concat;
const find = Array.prototype.find;
const forEach = Array.prototype.forEach;
const forEachMap = Map.prototype.forEach;
const numberValueOf = Number.prototype.valueOf;
const push = Array.prototype.push;
const forEachSet = Set.prototype.forEach;
const shift = Array.prototype.shift;
const stringValueOf = String.prototype.valueOf;
const substring = String.prototype.substring;

const tryGetExistingPointer = (data, value, pointerKey) => {
    // Simple PointerKeys are their own Pointers
    if (isSimplePointerKey(pointerKey)) {
        return pointerKey;
    }

    // Ensure the ref list exists
    data.k[pointerKey] = data.k[pointerKey] || [];

    // Try to find existing item matching the value
    const foundItem = find.call(data.k[pointerKey], (p) => {
        return p.v === value;
    });

    // If found, return its existing pointer
    return (foundItem || {}).p;
};

const encodePrimitive = (data, value) => {
    const p = genEncodePointer(data, value);
    data[p.k][p.i] = value;
    push.call(data.k[p.k], p);
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
    push.call(data.k[p.k], p);
    push.call(data.q, p);

    return p.p;
};

const encodeContainer = (data, box, pairs) => {
    const p = genEncodePointer(data, box);

    // As a container type, it might already have been encountered, so we use the existing PointerIndex if available
    const existingPointer = tryGetExistingPointer(data, box, p.k);

    if (existingPointer) {
        // encodeContainer is never called on a Simple Pointer Key value, so there is no need to account for a missing index here
        p.i = parseInt(substring.call(existingPointer, 2), 10);
        p.p = existingPointer;
    }
    else {
        push.call(data.k[p.k], p);
    }

    data[p.k][p.i] = data[p.k][p.i] || [];
    const container = data[p.k][p.i];

    // Encode each part of the Container
    forEach.call(pairs, (pair) => {
        push.call(container, [
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

const genWrappedObjectEncoder = (valueOf) => {
    return (data, value) => {
        return encodeContainer(data, value, concat.call([[null, valueOf.call(value)]], getAttachmentPairs(value)));
    };
};

const encoders = {
    'nm': encodePrimitive,
    'st': encodePrimitive,
    're': (data, value) => {
        const encodedValue = [
            value.source,
            value.flags,
            value.lastIndex,
        ];

        return encodeContainer(data, value, concat.call([[null, encodedValue]], getAttachmentPairs(value)));
    },
    'da': (data, value) => {
        let encodedValue = value.getTime();

        // Invalid Dates return NaN from getTime()
        if (encodedValue !== encodedValue) {
            // Encode as non-number value, which will generate an Invalid Date when converted
            encodedValue = '';
        }

        return encodeContainer(data, value, concat.call([[null, encodedValue]], getAttachmentPairs(value)));
    },
    'sy': (data, value) => {
        const p = genEncodePointer(data, value);

        const symbolStringKey = Symbol.keyFor(value);
        if (symbolStringKey !== void 0) {
            // For Registered Symbols, specify with 1 value and store the registered string value
            data[p.k][p.i] = encodeValue(data, [1, symbolStringKey]);
        }
        else {
            const symbolString = String(value);
            // For unique Symbols, specify with 0 value and also store the optional identifying string
            data[p.k][p.i] = encodeValue(data, [0, substring.call(symbolString, 7, symbolString.length - 1)]);
        }

        push.call(data.k[p.k], p);
        return p.p;
    },
    'fu': (data, value) => {
        return encodeContainer(data, value, concat.call([[null, String(value)]], getAttachmentPairs(value)));
    },
    'ob': encodeStandardContainer,
    'ar': encodeStandardContainer,
    'BO': genWrappedObjectEncoder(booleanValueOf),
    'NM': genWrappedObjectEncoder(numberValueOf),
    'ST': genWrappedObjectEncoder(stringValueOf),
    'I1': encodeStandardContainer,
    'U1': encodeStandardContainer,
    'C1': encodeStandardContainer,
    'I2': encodeStandardContainer,
    'U2': encodeStandardContainer,
    'I3': encodeStandardContainer,
    'U3': encodeStandardContainer,
    'F3': encodeStandardContainer,
    'F4': encodeStandardContainer,
    'Se': (data, value) => {
        const encodedValue = [];
        forEachSet.call(value, (part) => {
            push.call(encodedValue, part);
        });

        return encodeContainer(data, value, concat.call([[null, encodedValue]], getAttachmentPairs(value)));
    },
    'Ma': (data, value) => {
        const encodedValue = [];
        forEachMap.call(value, (value, key) => {
            push.call(encodedValue, [key, value]);
        });

        return encodeContainer(data, value, concat.call([[null, encodedValue]], getAttachmentPairs(value)));
    },
};

module.exports = (value) => {
    const data = {
        q: [], // Exploration Queue
        k: {}, // Known References
    };

    // Initialize data from the top-most value
    data.r = encodeValue(data, value);

    // While there are still references to explore, go through them
    while (data.q.length > 0) {
        encodeValue(data, shift.call(data.q).v);
    }

    // Remove encoding data no longer needed
    delete data.q;
    delete data.k;

    // Convert data object to a simple array of pairs
    return getAttachmentPairs(data);
};
