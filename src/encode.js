const extractPointerIndex = require('./utils/extractPointerIndex.js');
const genEncodePointer = require('./utils/genEncodePointer.js');
const genPairs = require('./utils/genPairs.js');
const getAllKeys = require('./utils/getAllKeys.js');
const getIndicesAndKeys = require('./utils/getIndicesAndKeys.js');
const getNonIndexKeys = require('./utils/getNonIndexKeys.js');
const pointers = require('./utils/pointers.js');

const tryGetExistingPointer = (data, value, pointerKey) => {
    // Simple PointerKeys are their own Pointers
    if (pointers.isSimplePointerKey(pointerKey)) {
        return pointerKey;
    }

    // Ensure the ref list exists
    data._.known[pointerKey] = data._.known[pointerKey] || [];

    // Try to find existing item matching the value
    const foundItem = data._.known[pointerKey].find((p) => {
        return p.v === value;
    });

    // If found, return its existing pointer
    return (foundItem || {}).p;
};

const encodePrimitive = (data, value) => {
    const p = genEncodePointer(data, value);
    data[p.k][p.i] = value;
    Array.prototype.push.call(data._.known[p.k], p);
    return p.p;
};

const encodeContainer = (data, box, pairs) => {
    const p = genEncodePointer(data, box);

    // As a container type, it might already have been encountered, so we use the existing PointerIndex if available
    const existingPointer = tryGetExistingPointer(data, box, p.k);

    if (existingPointer) {
        p.i = extractPointerIndex(existingPointer);
        p.p = existingPointer;
    }
    else {
        Array.prototype.push.call(data._.known[p.k], p);
    }

    data[p.k][p.i] = data[p.k][p.i] || [];
    const container = data[p.k][p.i];

    // Encode each part of the Container
    Array.prototype.forEach.call(pairs, (pair) => {
        const pointerKey = pointers.getPointerKey(pair[1]);

        // Already know of this value, encode its Pointer
        // Otherwise, we'd encode the same Container more than once
        const existingPointer = tryGetExistingPointer(data, pair[1], pointerKey);
        if (existingPointer) {
            Array.prototype.push.call(container, [
                encodeValue(data, pair[0]),
                existingPointer,
            ]);
            return;
        }

        // Found a new Container, ensure it is prepped for exploration
        if (pointers.isContainerPointerKey(pointerKey)) {
            const vp = genEncodePointer(data, pair[1]);

            data[vp.k][vp.i] = [];

            // Only allow one-level-deep container exploration by using the exploreQueue, otherwise circular references can cause infinite loops
            Array.prototype.push.call(data._.known[vp.k], vp);
            Array.prototype.push.call(data._.exploreQueue, vp);

            Array.prototype.push.call(container, [
                encodeValue(data, pair[0]),
                vp.p,
            ]);
            return;
        }

        // Unknown and not a container type: encode the encoded pair into container
        Array.prototype.push.call(container, [
            encodeValue(data, pair[0]),
            encodeValue(data, pair[1]),
        ]);
    });

    return p.p;
};

const encodeValue = (data, value) => {
    const pointerKey = pointers.getPointerKey(value);

    // Containers values need to handle their own existing Pointer handling
    if (!pointers.isContainerPointerKey(pointerKey)) {
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

const encoders = {
    'nm': encodePrimitive,
    'st': encodePrimitive,
    're': (data, value) => {
        const encodedValue = [
            value.source,
            value.flags,
            value.lastIndex,
        ];

        return encodeContainer(data, value, [[null, encodedValue]].concat(genPairs(value, getAllKeys(value))));
    },
    'da': (data, value) => {
        let encodedValue = value.getTime();

        // Invalid Dates return NaN from getTime()
        if (encodedValue !== encodedValue) {
            // Encode as non-number value, which will generate an Invalid Date when converted
            encodedValue = '';
        }

        return encodeContainer(data, value, [[null, encodedValue]].concat(genPairs(value, getAllKeys(value))));
    },
    'sy': (data, value) => {
        const p = genEncodePointer(data, value);

        const symbolStringKey = Symbol.keyFor(value);
        if (symbolStringKey !== void 0) {
            // For Registered Symbols, specify with 1 value and store the registered string value
            data[p.k][p.i] = encodeValue(data, [1, symbolStringKey]);
        }
        else {
            // For unique Symbols, specify with 0 value and also store the optional identifying string
            data[p.k][p.i] = encodeValue(data, [0, String.prototype.replace.call(String(value), /^Symbol\((.*)\)$/, '$1')]);
        }

        Array.prototype.push.call(data._.known[p.k], p);
        return p.p;
    },
    'fu': (data, value) => {
        return encodeContainer(data, value, [[null, String(value)]].concat(genPairs(value, getAllKeys(value))));
    },
    'ob': (data, value) => {
        return encodeContainer(data, value, genPairs(value, getAllKeys(value)));
    },
    'ar': (data, value) => {
        return encodeContainer(data, value, genPairs(value, getIndicesAndKeys(value)));
    },
    'BO': (data, value) => {
        return encodeContainer(data, value, [[null, Boolean.prototype.valueOf.call(value)]].concat(genPairs(value, getAllKeys(value))));
    },
    'NM': (data, value) => {
        return encodeContainer(data, value, [[null, Number.prototype.valueOf.call(value)]].concat(genPairs(value, getNonIndexKeys(value))));
    },
    'ST': (data, value) => {
        return encodeContainer(data, value, [[null, String.prototype.valueOf.call(value)]].concat(genPairs(value, getNonIndexKeys(value))));
    },
};

module.exports = (value) => {
    const data = {
        r: void 0,
        _: {
            known: {},
            exploreQueue: [],
        },
    };

    // Initialize data from the top-most value
    data.r = encodeValue(data, value);

    // While there are still references to explore, go through them
    while (data._.exploreQueue.length > 0) {
        encodeValue(data, data._.exploreQueue.shift().v);
    }

    // Remove data used during encoding process
    delete data._;

    return data;
};
