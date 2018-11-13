import getSystemName from '/utils/getSystemName.js';

const getAttachments = (v) => {
    const attached = {
        _indices: [],
        _attachments: [],
    };

    // Find all indices
    const indices = [];
    const indexObj = {};
    // Objects not based on Arrays, like Objects and Sets, will not find any indices here because we are using the Array.prototype.forEach
    Array.prototype.forEach.call(v, (value, index) => {
        indexObj[String(index)] = 1;
        indices.push(index);
    });

    // Have to use external index iterator because we want the counting to stop once the first index incongruity occurs
    let i = 0;

    // Find all String keys that are not indices
    // For Arrays, TypedArrays, and Object-Wrapped Strings, the keys list will include indices as strings, so account for that by checking the indexObj
    let keys = Object.keys(v).filter((key) => {
        return !indexObj[key];
    }).concat(Object.getOwnPropertySymbols(v).filter((symbol) => {
        // Ignore built-in Symbols
        // If the Symbol ID that is part of the Symbol global is not equal to the tested Symbol, then it is NOT a built-in Symbol
        return Symbol[String(symbol).slice(14, -1)] !== symbol;
    }));

    // Create the lists
    return indices.concat(keys).reduce((accumulator, key) => {
        if (key === i) {
            i += 1;
            accumulator._indices.push(v[key]);
        }
        else {
            accumulator._attachments.push([key, v[key]]);
        }
        return accumulator;
    }, attached);
};

const getPointerKey = (store, item) => {
    const pointerKey = Object.keys(store._types).find((typeKey) => {
        return store._types[typeKey]._identify(item);
    });

    if (!pointerKey && !store._safe) {
        throw(new Error(`Cannot encode unsupported type "${getSystemName(item)}".`));
    }

    // In safe mode, Unsupported types are stored as plain, empty objects, so that they retain their referencial integrity, but can still handle attachments
    return pointerKey ? pointerKey : 'ob';
};

const prepExplorableItem = (store, item) => {
    // Type is known type and is a reference type (not simple), it should be explored
    if ((store._types[getPointerKey(store, item)] || {})._build) {
        store._explore.push(item);
    }
};

export default (store, item) => {
    const pointerKey = getPointerKey(store, item);

    // Simple type, return pointer (pointer key)
    if (!store._types[pointerKey]._build) {
        return pointerKey;
    }

    // Already encountered, return pointer
    const existingDataItem = store._references.get(item);
    if (existingDataItem !== void 0) {
        return existingDataItem._pointer;
    }

    // Ensure location exists
    store._output[pointerKey] = store._output[pointerKey] || [];

    // Add temp value to update the location
    store._output[pointerKey].push(void 0);

    const pointerIndex = store._output[pointerKey].length - 1;

    const dataItem = {
        _key: pointerKey,
        _index: pointerIndex,
        _pointer: pointerKey + pointerIndex,
        _reference: item,
        _indices: [],
        _attachments: [],
    };

    // Store the reference uniquely along with location information
    store._references.set(item, dataItem);

    /* istanbul ignore next */
    if (store._types[pointerKey]._deferredEncode) {
        store._deferred.push(dataItem);
    }

    const attached = getAttachments(item);
    let indices = attached._indices;
    const attachments = attached._attachments;

    // Object-wrapped Strings will include indices for each character in the string
    if (store._types[pointerKey]._ignoreIndices) {
        indices = [];
    }

    // Save the known attachments for the next phase so we do not have to reacquire them
    dataItem._indices = indices;
    dataItem._attachments = attachments;

    // Prep sub-items to be explored later
    indices.forEach((s) => {
        prepExplorableItem(store, s);
    });
    attachments.forEach((s) => {
        prepExplorableItem(store, s[0]);
        prepExplorableItem(store, s[1]);
    });

    return dataItem._pointer;
};
