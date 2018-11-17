import encounterItem from '/utils/encounterItem.js';
import types from '/types.js';

const prepOutput = (store, root) => {
    // Having found all data structure contents, encode each value into the encoded output
    store._references.forEach((dataItem) => {
        // Encode the actual value
        store._output[dataItem._key][dataItem._index] = types[dataItem._key]._encodeValue(store, dataItem);

        // Encode any values attached to the value
        if (dataItem._attachments.length > 0) {
            store._output[dataItem._key][dataItem._index] = store._output[dataItem._key][dataItem._index].concat(dataItem._attachments.map((attachment) => {
                return [
                    encounterItem(store, attachment[0]),
                    encounterItem(store, attachment[1]),
                ];
            }));
        }
    });

    store._output.r = root;
    store._output.v = '1.0.0';

    // Convert the output object form to an output array form
    const output = Object.keys(store._output).map((key) => {
        return [
            key,
            store._output[key],
        ];
    });

    if (typeof store._onFinish === 'function') {
        store._onFinish(output);
    }
    else {
        return output;
    }
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
        _output: {},
    };

    const rootPointerKey = encounterItem(store, value);

    // Root value is simple, can skip main encoding steps
    if (types[rootPointerKey]) {
        return prepOutput(store, rootPointerKey);
    }

    // Explore through the data structure
    store._explore.push(value);
    while (store._explore.length) {
        encounterItem(store, store._explore.shift());
    }

    /* istanbul ignore next */
    if (store._deferred.length > 0) {
        // Handle Blob or File type encoding
        if (typeof options.onFinish !== 'function') {
            if (store._safe) {
                // In safe mode, if the onFinish function is not provided, File and Blob object data will be discarded as empty and returns data immediately
                return prepOutput(store, rootPointerKey);
            }

            throw new Error('Found deferred type, but no onFinish option provided.');
        }

        let deferredLength = store._deferred.length;

        const onCallback = () => {
            deferredLength -= 1;
            if (deferredLength === 0) {
                return prepOutput(store, rootPointerKey);
            }
        };

        store._deferred.forEach((dataItem) => {
            types[dataItem._key]._deferredEncode(store, dataItem, onCallback);
        });

        return;
    }

    // Normal output without deferment
    return prepOutput(store, rootPointerKey);
};
