import genError from '/utils/genError.js';
import getSystemName from '/utils/getSystemName.js';
import getAttachments from '/utils/getAttachments.js';
import findItemKey from '/utils/getItemKey.js';

const getPointerKey = (store, item) => {
    const pointerKey = findItemKey(store, item);

    if (!pointerKey && !store._compat) {
        const type = getSystemName(item);
        throw genError(`Cannot encode unsupported type "${type}".`, 'encode', type);
    }

    // In compat mode, Unsupported types are stored as plain, empty objects, so that they retain their referencial integrity, but can still handle attachments
    return pointerKey ? pointerKey : 'Ob';
};

export default (store, item) => {
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
    store._output[pointerKey].push(void 0);

    const pointerIndex = store._output[pointerKey].length - 1;

    const attached = getAttachments(item, store._encodeSymbolKeys);

    const dataItem = {
        _key: pointerKey,
        _index: pointerIndex,
        _pointer: pointerKey + pointerIndex,
        _reference: item,

        // Save the known attachments for the next phase so we do not have to reacquire them
        // Strings and Object-wrapped Strings will include indices for each character in the string, so ignore them
        _indexed: store._types[pointerKey]._ignoreIndices ? [] : attached._indexed,
        _keyed: attached._keyed,
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
