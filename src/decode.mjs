import extractIndex from '/src/utils/extractIndex.mjs';
import extractKey from '/src/utils/extractKey.mjs';
import getPointerKey from '/src/utils/getPointerKey.mjs';
import isAttachable from '/src/utils/isAttachable.mjs';
import isSimple from '/src/utils/isSimple.mjs';
import types from '/src/utils/types.mjs';

const explorePointer = (store, pointer) => {
    const pointerKey = extractKey(pointer);

    if (!types[pointerKey] || store.decoded[pointer] !== void 0 || isSimple(pointerKey)) {
        return;
    }

    const dataItem = {
        key: pointerKey,
        index: extractIndex(pointer),
        pointer: pointer,
        value: void 0,
        parts: [],
    };

    store.decoded[pointer] = dataItem;

    dataItem.value = types[pointerKey].generateReference(store, dataItem.key, dataItem.index);
    dataItem.parts = store.encoded[dataItem.key][dataItem.index];

    if (isAttachable(dataItem.key)) {
        dataItem.parts.forEach((part) => {
            part.forEach((subPart) => {
                if (getPointerKey(subPart) === 'ar') {
                    store.explore.push(subPart[0]);
                    store.explore.push(subPart[1]);
                }
                else {
                    store.explore.push(subPart);
                }
            });
        });
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

    const rootPointerKey = extractKey(store.encoded.r);

    if (isSimple(rootPointerKey)) {
        return types[rootPointerKey].build();
    }

    store.explore.push(store.encoded.r);
    while (store.explore.length) {
        explorePointer(store, store.explore.shift());
    }

    Object.values(store.decoded).forEach((dataItem) => {
        types[dataItem.key].build(store, dataItem);
    });

    if (!types[extractKey(store.encoded.r)]) {
        return store.encoded.r;
    }

    return store.decoded[store.encoded.r].value;
};
