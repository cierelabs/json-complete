import extractPointer from '/utils/extractPointer.js';
import getSystemName from '/utils/getSystemName.js';
import isSimple from '/utils/isSimple.js';
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

export default (encoded) => {
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
