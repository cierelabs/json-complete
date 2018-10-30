import encounterItem from '/src/utils/encounterItem.mjs';
import getPointerKey from '/src/utils/getPointerKey.mjs';
import isSimple from '/src/utils/isSimple.mjs';
import types from '/src/utils/types.mjs';

const prepOutput = (store, onFinish) => {
    delete store._;

    const output = Object.keys(store).map((key) => {
        return [
            key,
            store[key],
        ];
    });

    if (typeof onFinish === 'function') {
        onFinish(output);
        return;
    }

    return output;
};

export default (value, onFinish) => {
    const store = {
        _: {
            // TODO: have fallback in place for when Map is not natively supported
            // TODO: pull out map implementation into separate file so details can be hidden
            references: new Map(), // Known References
            explore: [], // Exploration queue
            deferred: [], // Deferment List of dataItems to encode later, in callback form, such as blobs and files, which are non-synchronous by design
        },
    };

    const rootPointerKey = getPointerKey(value);

    // Root value is simple, can skip main encoding steps
    if (isSimple(rootPointerKey)) {
        store.r = rootPointerKey;
        return prepOutput(store, onFinish);
    }

    store._.explore.push(value);

    while (store._.explore.length) {
        encounterItem(store, store._.explore.shift());
    }

    store._.references.forEach((dataItem) => {
        store[dataItem.key][dataItem.index] = types[dataItem.key].encodeValue(store, dataItem);

        if (dataItem.attachments.length > 0) {
            store[dataItem.key][dataItem.index] = store[dataItem.key][dataItem.index].concat(dataItem.attachments.map((attachment) => {
                // TODO: These may not need the full encounter logic, just a lookup of pointer
                return [
                    encounterItem(store, attachment[0]),
                    encounterItem(store, attachment[1]),
                ];
            }));
        }
    });

    // Handle Blob or File type encoding
    /* istanbul ignore next */
    if (store._.deferred.length > 0) {
        if (typeof onFinish !== 'function') {
            throw 'Callback function required when encoding deferred objects such as File and Blob.';
        }

        let deferredLength = store._.deferred.length;

        const onCallback = () => {
            deferredLength -= 1;
            if (deferredLength === 0) {
                store.r = store._.references.get(value).pointer;
                return prepOutput(store, onFinish);
            }
        }

        store._.deferred.forEach((dataItem) => {
            types[dataItem.key].deferredEncode(store, dataItem, onCallback);
        });

        return;
    }

    store.r = store._.references.get(value).pointer;
    return prepOutput(store, onFinish);
};
