import extractPointer from '/utils/extractPointer.js';
import getSystemName from '/utils/getSystemName.js';
import types from '/types.js';

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

export default (encoded, options) => {
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
