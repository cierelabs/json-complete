import decompressValues from '/utils/compression/decompressValues.js';
import extractPointer from '/utils/extractPointer.js';
import getSystemName from '/utils/getSystemName.js';
import types from '/types.js';

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
    if (!types[p._key]) {
        // In compat mode, ignore
        if (store._compat) {
            return;
        }

        throw new Error(`Cannot decode unrecognized pointer type "${p._key}".`);
    }

    // If a simple pointer or an already explored pointer, ignore
    if (types[pointer] || store._decoded[pointer] !== void 0) {
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
        store._decoded[pointer]._reference = types[p._key]._generateReference(store, store._encoded[p._key][p._index]);
    } catch (e) {
        if (!store._compat) {
            // This can happen if the data is malformed, or if the environment does not support the type the data has encoded
            throw new Error(`Cannot decode recognized pointer type "${p._key}".`);
        }

        // In compat mode, ignore
    }

    if (getSystemName(store._decoded[pointer]._parts) === 'Array') {
        exploreParts(store, store._decoded[pointer]._parts);
    }
};

export default (encoded, options) => {
    options = options || {};

    const parsed = JSON.parse(encoded);
    const formatted = parsed.slice(2).reduce((accumulator, e) => {
        accumulator[e[0]] = decompressValues(e[0], e[1], types);
        return accumulator;
    }, {});

    const rootPointerKey = parsed[0];

    const store = {
        _compat: options.compat,
        _types: types,
        _encoded: formatted,
        _decoded: {},
        _explore: [],
    };

    // Simple pointer, return value
    if (types[rootPointerKey]) {
        return types[rootPointerKey]._value;
    }

    const rootP = extractPointer(rootPointerKey);

    // Unrecognized root type
    if (!types[rootP._key]) {
        if (store._compat) {
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
    // IE11 and lower do not support Object.values
    Object.keys(store._decoded).forEach((key) => {
        const dataItem = store._decoded[key];
        types[dataItem._key]._build(store, dataItem);
    });

    return store._decoded[rootPointerKey]._reference;
};
