const getPointerKey = require('./utils/new/getPointerKey.js');

const types = {
    un: {
        // undefined
        simple: 1,
    },
    nl: {
        // null
        simple: 1,
    },
    bt: {
        // true
        simple: 1,
    },
    bf: {
        // false
        simple: 1,
    },
    na: {
        // NaN
        simple: 1,
    },
    '-i': {
        // -Infinity
        simple: 1,
    },
    '+i': {
        // Infinity
        simple: 1,
    },
    n0: {
        // -0
        simple: 1,
    },
    nm: {
        // Number
        encodeValue: (store, dataItem) => {
            return dataItem.value;
        },
    },
    st: {
        // String
        encodeValue: (store, dataItem) => {
            return dataItem.value;
        },
    },
    ar: {
        // Array
        attachable: 1,
        encodeValue: (store, dataItem) => {
            return [
                dataItem.indices.map((subValue) => {
                    return getPointer(store, subValue);
                }),
            ];
        },
    },
    ob: {
        // Object
        attachable: 1,
        encodeValue: (store, dataItem) => {
            return [];
        },
    },
    ST: {
        // Object-wrapped String
        attachable: 1,
        ignoreIndices: 1,
        encodeValue: (store, dataItem) => {
            const primitiveValue = dataItem.value.valueOf();
            encounterItem(store, primitiveValue);
            return [
                [
                    getPointer(store, primitiveValue),
                ],
            ];
        },
    },
};

const isSimple = (pointerKey) => {
    return (types[pointerKey] || {}).simple;
};

const isEncodable = (pointerKey) => {
    return (types[pointerKey] || {}).encodeValue;
};

const isAttachable = (pointerKey) => {
    return (types[pointerKey] || {}).attachable;
};

const isExplorable = (store, item) => {
    return store._.references.get(item) === void 0 && !isSimple(getPointerKey(item));
};

const getPointer = (store, value) => {
    const pointerKey = getPointerKey(value);
    return isSimple(pointerKey) ? pointerKey : store._.references.get(value).pointer;
};

const getAttachments = (v) => {
    const attached = {
        indices: [],
        attachments: [],
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
            accumulator.indices.push(v[key]);
        }
        else {
            accumulator.attachments.push([key, v[key]]);
        }
        return accumulator;
    }, attached);
};

const encodeAttachments = (store, dataItem) => {
    store[dataItem.key][dataItem.index] = store[dataItem.key][dataItem.index].concat(dataItem.attachments.map((attachment) => {
        return [
            getPointer(store, attachment[0]),
            getPointer(store, attachment[1]),
        ];
    }));
};

const encounterItem = (store, item) => {
    if (!isExplorable(store, item)) {
        return;
    }

    const pointerKey = getPointerKey(item);

    // Ensure location exists
    store[pointerKey] = store[pointerKey] || [];

    // Add temp value to update the location
    store[pointerKey].push(void 0);

    const pointerIndex = store[pointerKey].length - 1;

    const dataItem = {
        key: pointerKey,
        index: pointerIndex,
        pointer: `${pointerKey}${pointerIndex}`,
        value: item,
        indices: [],
        attachments: [],
    };

    // Store the reference uniquely along with location information
    store._.references.set(item, dataItem);

    if (!isAttachable(pointerKey)) {
        return;
    }

    let { indices, attachments } = getAttachments(item);

    // Object-wrapped Strings will include indices for each character in the string
    if (types[pointerKey].ignoreIndices) {
        indices = [];
    }

    // Save the known attachments for the next phase so we do not have to reacquire them
    dataItem.indices = indices;
    dataItem.attachments = attachments;

    // Prep sub-items to be explored later
    indices.forEach((s) => {
        if (isExplorable(store, s)) {
            store._.explore.push(s);
        }
    });
    attachments.forEach((s) => {
        if (isExplorable(store, s[0])) {
            store._.explore.push(s[0]);
        }
        if (isExplorable(store, s[1])) {
            store._.explore.push(s[1])
        }
    });
};

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

module.exports = (value, onFinish) => {
    const store = {
        _: {
            // TODO: have fallback in place for when Map is not natively supported
            // TODO: pull out map implementation into separate file so details can be hidden
            references: new Map(), // Known References
            explore: [], // Exploration queue
            blobs: [], // Blob and File Deferment List
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
        if (isEncodable(dataItem.key)) {
            store[dataItem.key][dataItem.index] = types[dataItem.key].encodeValue(store, dataItem);
        }
        if (dataItem.attachments.length > 0) {
            encodeAttachments(store, dataItem);
        }
    });

    // TODO: Add blob deferment list handling

    store.r = store._.references.get(value).pointer;
    return prepOutput(store, onFinish);
};