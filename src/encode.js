import encounterItem from '/utils/encounterItem.js';
import getSystemName from '/utils/getSystemName.js';
import isSimple from '/utils/isSimple.js';
import types from '/types.js';

const prepOutput = (store, root) => {
    const onFinish = getSystemName(store._onFinish) === 'Function' ? store._onFinish : void 0;

    store = Object.keys(store).reduce((accumulator, key) => {
        if (key[0] !== '_') {
            accumulator[key] = store[key];
        }

        return accumulator;
    }, {});

    store.r = root;
    store.v = '1.0.0';

    const output = Object.keys(store).map((key) => {
        return [
            key,
            store[key],
        ];
    });

    if (onFinish) {
        onFinish(output);
        return;
    }

    return output;
};

export default (value, options) => {
    options = options || {};

    const store = {
        _safe: options.safeMode,
        _onFinish: options.onFinish,
        _types: types,
        _references: new Map(), // Known References
        _explore: [], // Exploration queue
        _deferred: [], // Deferment List of dataItems to encode later, in callback form, such as blobs and files, which are non-synchronous by design
    };

    const rootPointerKey = encounterItem(store, value);

    // Root value is simple, can skip main encoding steps
    if (isSimple(types, rootPointerKey)) {
        return prepOutput(store, rootPointerKey);
    }

    store._explore.push(value);

    while (store._explore.length) {
        encounterItem(store, store._explore.shift());
    }

    store._references.forEach((dataItem) => {
        store[dataItem._key][dataItem._index] = types[dataItem._key]._encodeValue(store, dataItem);

        if (dataItem._attachments.length > 0) {
            store[dataItem._key][dataItem._index] = store[dataItem._key][dataItem._index].concat(dataItem._attachments.map((attachment) => {
                return [
                    encounterItem(store, attachment[0]),
                    encounterItem(store, attachment[1]),
                ];
            }));
        }
    });

    /* istanbul ignore next */
    if (store._deferred.length > 0) {
        // Handle Blob or File type encoding
        if (getSystemName(store._onFinish) !== 'Function') {
            if (store._safe) {
                // In safe mode, if the onFinish function is not provided, File and Blob object data will be discarded as empty
                return prepOutput(store, store._references.get(value)._pointer)
            }

            throw new Error('Encoded value contained a deferred type (File and Blob), but no `options.onFinish` function provided.');
        }

        let deferredLength = store._deferred.length;

        const onCallback = () => {
            deferredLength -= 1;
            if (deferredLength === 0) {
                return prepOutput(store, store._references.get(value)._pointer);
            }
        };

        store._deferred.forEach((dataItem) => {
            types[dataItem._key]._deferredEncode(store, dataItem, onCallback);
        });

        return;
    }

    // Normal output without deferment
    return prepOutput(store, store._references.get(value)._pointer);
};
