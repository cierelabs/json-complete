import extractPointer from '/src/utils/extractPointer.mjs';
import getPointerKey from '/src/utils/getPointerKey.mjs';
import isSimple from '/src/utils/isSimple.mjs';
import types from '/src/types.mjs';

// Recursively look at the reference set for exploration values
// This handles both pair arrays and individual values
// This recursion is fine because it has a maximum depth of 3
const exploreParts = (store, parts) => {
    if (getPointerKey(parts) === 'ar') {
        parts.forEach((part) => {
            exploreParts(store, part);
        });
    }
    else {
        store.explore.push(parts);
    }
};

const explorePointer = (store, pointer) => {
    const p = extractPointer(pointer);

    if (!types[p.key] || store.decoded[pointer] !== void 0 || isSimple(p.key)) {
        return;
    }

    const dataItem = {
        key: p.key,
        index: p.index,
        pointer: pointer,
        value: void 0,
        parts: [],
    };

    store.decoded[pointer] = dataItem;

    dataItem.value = types[p.key].generateReference(store, dataItem.key, dataItem.index);
    dataItem.parts = store.encoded[dataItem.key][dataItem.index];

    if (getPointerKey(dataItem.parts) === 'ar') {
        exploreParts(store, dataItem.parts);
    }
};

export default (encoded) => {
    const store = {
        encoded: encoded.reduce((accumulator, e) => {
            accumulator[e[0]] = e[1];
            return accumulator;
        }, {}),
        decoded: {},
        explore: [],
    };

    const rootP = extractPointer(store.encoded.r);

    // Unrecognized root type, return pointer
    if (!types[rootP.key]) {
        return store.encoded.r;
    }

    if (isSimple(rootP.key)) {
        return types[rootP.key].build();
    }

    store.explore.push(store.encoded.r);
    while (store.explore.length) {
        explorePointer(store, store.explore.shift());
    }

    Object.values(store.decoded).forEach((dataItem) => {
        types[dataItem.key].build(store, dataItem);
    });

    return store.decoded[store.encoded.r].value;
};
