const genEncodePointer = require('./utils/genEncodePointer.js');
const genPairs = require('./utils/genPairs.js');
const getIndicesAndKeys = require('./utils/getIndicesAndKeys.js');
const getAllKeys = require('./utils/getAllKeys.js');
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
    data._.known[p.k].push(p);
    return p.p;
};

const encodeTransformedValue = (data, originalValue, encodedValue) => {
    const p = genEncodePointer(data, originalValue);
    data[p.k][p.i] = encodeValue(data, encodedValue);
    data._.known[p.k].push(p);
    return p.p;
};

const encodeContainer = (data, box, getPairs) => {
    const p = genEncodePointer(data, box);

    // As a container type, it might already have been encountered, so we use the existing PointerIndex if available
    const existingPointer = tryGetExistingPointer(data, box, p.k);

    if (existingPointer) {
        p.i = pointers.extractPointerIndex(existingPointer);
        p.p = existingPointer;
    }
    else {
        data._.known[p.k].push(p);
    }

    data[p.k][p.i] = data[p.k][p.i] || [];
    const container = data[p.k][p.i];

    // Encode each part of the Container
    Array.prototype.forEach.call(getPairs(box), (pair) => {
        const pointerKey = pointers.getPointerKey(pair[1]);

        // Already know of this value, encode its Pointer
        // Otherwise, we'd encode the same Container more than once
        const existingPointer = tryGetExistingPointer(data, pair[1], pointerKey);
        if (existingPointer) {
            container.push([
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
            data._.known[vp.k].push(vp);
            data._.exploreQueue.push(vp);

            container.push([
                encodeValue(data, pair[0]),
                vp.p,
            ]);
            return;
        }

        // Unknown and not a container type: encode the encoded pair into container
        container.push([
            encodeValue(data, pair[0]),
            encodeValue(data, pair[1]),
        ]);
    });

    return p.p;
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
        // return [[null, [value.source, value.flags, value.lastIndex]]].concat(genPairs(value, getAllKeys(value)));

        return encodeTransformedValue(data, value, encodedValue);
    },
    'da': (data, value) => {
        let encodedValue = value.getTime();

        // Invalid Dates return NaN from getTime()
        if (encodedValue !== encodedValue) {
            // Encode as non-number value, which will generate an Invalid Date when converted
            encodedValue = '';
        }

        return encodeContainer(data, value, (value) => {
            return [[null, encodedValue]].concat(genPairs(value, getAllKeys(value)));
        });
    },
    'sy': (data, value) => {
        let encodedValue;
        const symbolStringKey = Symbol.keyFor(value);
        if (symbolStringKey !== void 0) {
            // For Registered Symbols, specify with 1 value and store the registered string value
            encodedValue = [1, symbolStringKey];
        }
        else {
            // For unique Symbols, specify with 0 value and also store the optional identifying string
            encodedValue = [0, String(value).replace(/^Symbol\((.*)\)$/, '$1')]
        }

        return encodeTransformedValue(data, value, encodedValue);
    },
    'fu': (data, value) => {
        return encodeContainer(data, value, (value) => {
            return [[null, String(value)]].concat(genPairs(value, getAllKeys(value)));
        });
    },
    'ob': (data, value) => {
        return encodeContainer(data, value, (value) => {
            return genPairs(value, getAllKeys(value));
        });
    },
    'ar': (data, value) => {
        return encodeContainer(data, value, (value) => {
            return genPairs(value, getIndicesAndKeys(value));
        });
    },
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

module.exports = (value) => {
    const data = {
        root: void 0,
        _: {
            known: {},
            exploreQueue: [],
        },
    };

    // Initialize data from the top-most value
    data.root = encodeValue(data, value);

    // While there are still references to explore, go through them
    while (data._.exploreQueue.length > 0) {
        encodeValue(data, data._.exploreQueue.shift().v);
    }

    // Remove data used during encoding process
    delete data._;

    return data;
};
