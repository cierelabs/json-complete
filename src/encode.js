import findItemKey from '/utils/getItemKey.js';
import genError from '/utils/genError.js';
import genReferenceTracker from '/utils/genReferenceTracker.js';
import getAttachments from '/utils/getAttachments.js';
import getSystemName from '/utils/getSystemName.js';
import types from '/types.js';

const getPointerKey = (store, item) => {
    const pointerKey = findItemKey(store, item);

    if (!pointerKey && !store._compat) {
        const type = getSystemName(item);
        throw genError(`Cannot encode unsupported type "${type}".`, 'encode', type);
    }

    // In compat mode, Unsupported types are stored as plain, empty objects, so that they retain their referencial integrity, but can still handle attachments
    return pointerKey ? pointerKey : 'Ob';
};

const encounterItem = (store, item) => {
    const pointerKey = getPointerKey(store, item);

    // Simple type, return pointer (pointer key)
    if (!store._types[pointerKey]._build) {
        return pointerKey;
    }

    // Already encountered, return pointer
    const existingDataItem = store._references._get(item, pointerKey);
    if (existingDataItem !== void 0) {
        return existingDataItem._pointer;
    }

    // Ensure location exists
    store._output[pointerKey] = store._output[pointerKey] || [];

    // Add temp value to update the location
    store._output[pointerKey].push(0);

    const pointerIndex = store._output[pointerKey].length - 1;

    const dataItem = {
        _key: pointerKey,
        _index: pointerIndex,
        _pointer: pointerKey + pointerIndex,
        _reference: item,
    };

    // Store the reference uniquely along with location information
    store._references._set(item, dataItem);

    // Some values can only be obtained asynchronously, so add them to a list of items to check
    /* istanbul ignore next */
    if (store._types[pointerKey]._deferredEncode) {
        store._deferred.push(dataItem);
    }

    return dataItem._pointer;
};

const encodeAll = (store, resumeFromIndex) => {
    return store._references._resumableForEach((dataItem) => {
        let encodedForm = types[dataItem._key]._encodeValue(dataItem._reference, getAttachments(dataItem._reference, store._encodeSymbolKeys));

        // All types that encode directly to Strings (String, Number, BigInt, and Symbol) do not have attachments
        if (getSystemName(encodedForm) !== 'String') {
            // Encounter all data in the encoded form to get the appropriate Pointers and
            encodedForm = encodedForm.map((part) => {
                if (getSystemName(part) === 'Array') {
                    return part.map((subPart) => {
                        return encounterItem(store, subPart);
                    });
                }

                // Wrapped Primitive Types have a single value for the first item, rather than an Array
                return encounterItem(store, part);
            });
        }

        store._output[dataItem._key][dataItem._index] = encodedForm;
    }, resumeFromIndex);
};

const prepOutput = (store, root) => {
    store._output.r = root;
    store._output.v = '1.0.0';

    // Convert the output object form to an output array form
    const output = JSON.stringify(Object.keys(store._output).map((key) => {
        return [
            key,
            store._output[key],
        ];
    }), null, store._space);

    if (typeof store._onFinish === 'function') {
        store._onFinish(output);
    }
    else {
        return output;
    }
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
        _space: options.space,
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
            types[dataItem._key]._deferredEncode(dataItem._reference, store._output[dataItem._key][dataItem._index], (data) => {
                return encounterItem(store, data);
            }, onCallback);
        });

        return;
    }

    // Normal output without deferment
    return prepOutput(store, rootPointerKey);
};
