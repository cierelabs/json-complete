import encounterItem from '/utils/encounterItem.js';
import genError from '/utils/genError.js';
import genReferenceTracker from '/utils/genReferenceTracker.js';
import types from '/types.js';

const prepOutput = (store, root) => {
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

const encodeAll = (store, resumeFromIndex) => {
    return store._references._resumableForEach((dataItem) => {
        // Encode the actual value
        store._output[dataItem._key][dataItem._index] = types[dataItem._key]._encodeValue(store, dataItem);

        // Encode any values attached to the value
        if (dataItem._attachments.length > 0) {
            store._output[dataItem._key][dataItem._index] = store._output[dataItem._key][dataItem._index].concat(dataItem._attachments.map((attachment) => {
                // Technically, here we might expect to only request items from the already explored set
                // However, some types, particularly non-attachment containers, like Set and Map, can contain additional values not explored
                // By encountering attachments after running the encodeValue function, additional, hidden values in the container can be added to the reference set
                return [
                    encounterItem(store, attachment[0]),
                    encounterItem(store, attachment[1]),
                ];
            }));
        }
    }, resumeFromIndex);
};

export default (value, options) => {
    options = options || {};

    let typeMap = {};
    let wrappedTypeMap = {};

    Object.keys(types).forEach((key) => {
        const systemName = types[key]._systemName;

        if (systemName) {
            typeMap[systemName] = key;
        }

        if ((systemName || '')[0] === '_') {
            wrappedTypeMap[systemName.slice(1)] = systemName;
        }
    });

    const store = {
        _compat: options.compat,
        _encodeSymbolKeys: options.encodeSymbolKeys,
        _onFinish: options.onFinish,
        _types: types,
        _typeMap: typeMap,
        _wrappedTypeMap: wrappedTypeMap,
        _references: genReferenceTracker(options.encodeSymbolKeys), // Known References
        _deferred: [], // Deferment List of dataItems to encode later, in callback form, such as blobs and files, which are non-synchronous by design
        _output: {},
    };

    const rootPointerKey = encounterItem(store, value);

    const resumeIndex = encodeAll(store);

    // Node does not support the deferred types
    /* istanbul ignore next */
    if (store._deferred.length > 0) {
        // Handle Blob or File type encoding
        if (typeof options.onFinish !== 'function') {
            if (store._compat) {
                // In compat mode, if the onFinish function is not provided, File and Blob object data will be discarded as empty and returns data immediately
                return prepOutput(store, rootPointerKey);
            }

            throw genError('Deferred Types require onFinish option.', 'encode');
        }

        let deferredLength = store._deferred.length;

        const onCallback = () => {
            deferredLength -= 1;
            if (deferredLength === 0) {
                encodeAll(store, resumeIndex);
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
