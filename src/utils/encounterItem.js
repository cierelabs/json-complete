import getSystemName from '/utils/getSystemName.js';
import isSimple from '/utils/isSimple.js';

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
        const symbolStringMatches = String(symbol).match(/^Symbol\(Symbol\.([^\)]*)\)$/);
        return symbolStringMatches === null || symbolStringMatches.length !== 2 || Symbol[symbolStringMatches[1]] !== symbol;
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

const getPointerKey = (types, value, isSafeMode) => {
    const pointerKey = Object.keys(types).find((typeKey) => {
        return types[typeKey]._identify(value);
    });

    if (!pointerKey) {
        if (isSafeMode) {
            // In safe mode, Unsupported types are stored as plain, empty objects, so that they retain their referencial integrity, but can still handle attachments
            return 'ob';
        }

        throw(new Error(`Unsupported type "${getSystemName(value)}". Encoding halted.`))
    }

    return pointerKey;
};

const prepExplorableItem = (store, item) => {
    if (store._references.get(item) === void 0 && !isSimple(store._types, getPointerKey(store._types, item, store._safe))) {
        store._explore.push(item);
    }
};

export default (store, item) => {
    const pointerKey = getPointerKey(store._types, item, store._safe);

    if (isSimple(store._types, pointerKey)) {
        return pointerKey;
    }

    const existingDataItem = store._references.get(item);

    if (existingDataItem !== void 0) {
        return existingDataItem._pointer;
    }

    // Ensure location exists
    store[pointerKey] = store[pointerKey] || [];

    // Add temp value to update the location
    store[pointerKey].push(void 0);

    const pointerIndex = store[pointerKey].length - 1;

    const dataItem = {
        _key: pointerKey,
        _index: pointerIndex,
        _pointer: pointerKey + pointerIndex,
        _value: item,
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
