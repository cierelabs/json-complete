const getPointerKey = require('./utils/new/getPointerKey.js');

const types = {
    un: {
        // undefined
        simple: 1,
        build: () => {
            return undefined;
        },
    },
    nl: {
        // null
        simple: 1,
        build: () => {
            return null;
        },
    },
    bt: {
        // true
        simple: 1,
        build: () => {
            return true;
        },
    },
    bf: {
        // false
        simple: 1,
        build: () => {
            return false;
        },
    },
    na: {
        // NaN
        simple: 1,
        build: () => {
            return NaN;
        },
    },
    '-i': {
        // -Infinity
        simple: 1,
        build: () => {
            return -Infinity;
        },
    },
    '+i': {
        // Infinity
        simple: 1,
        build: () => {
            return Infinity;
        },
    },
    n0: {
        // -0
        simple: 1,
        build: () => {
            return -0;
        },
    },
    nm: {
        // Number
        generateReference: (store, pointerIndex) => {
            return store.encoded.nm[pointerIndex];
        },
        build: (store, dataItem) => {
            return dataItem.value;
        },
    },
    st: {
        // String
        generateReference: (store, pointerIndex) => {
            return store.encoded.st[pointerIndex];
        },
        build: (store, dataItem) => {
            return dataItem.value;
        },
    },
    ar: {
        // Array
        attachable: 1,
        generateReference: () => {
            return [];
        },
        build: (store, dataItem) => {
            dataItem.parts[0].forEach((pointer, index) => {
                dataItem.value[index] = getDecoded(store, pointer);
            });

            dataItem.parts.slice(1).forEach((pair) => {
                dataItem.value[getDecoded(store, pair[0])] = getDecoded(store, pair[1]);
            });

            dataItem.built.push(dataItem.value);
        },
    },
    ob: {
        // Object
        attachable: 1,
        generateReference: () => {
            return {};
        },
        build: (store, dataItem) => {
            dataItem.parts.forEach((pair) => {
                dataItem.value[getDecoded(store, pair[0])] = getDecoded(store, pair[1]);
            });

            dataItem.built.push(dataItem.value);
        },
    },
    ST: {
        // Object-wrapped String
        attachable: 1,
        ignoreIndices: 1,
        generateReference: (store, pointerIndex) => {
            const stringPointer = store.encoded.ST[pointerIndex][0][0];
            return new String(types.st.generateReference(store, parseInt(stringPointer.substring(2), 10)));
        },
        build: (store, dataItem) => {
            dataItem.parts.slice(1).forEach((pair) => {
                dataItem.value[getDecoded(store, pair[0])] = getDecoded(store, pair[1]);
            });

            dataItem.built.push(dataItem.value);
        },
    },
};

const getDecoded = (store, pointer) => {
    const pointerKey = pointer.substring(0, 2);

    if (isSimple(pointerKey)) {
        return types[pointerKey].build();
    }

    return store.decoded[pointer].value;
};

const build = (store, pointer) => {
    const pointerKey = pointer.substring(0, 2);

    if (!types[pointerKey]) {
        return {};
    }

    if (isSimple(pointerKey)) {
        return types[pointerKey].build();
    }

    if (store.decoded[pointer].built.length > 0) {
        return store.decoded[pointer].built[0];
    }

    return types[pointerKey].build(store, store.decoded[pointer]);
};

const isSimple = (pointerKey) => {
    return (types[pointerKey] || {}).simple;
};

const isAttachable = (pointerKey) => {
    return (types[pointerKey] || {}).attachable;
};

const isExplorable = (store, pointer, pointerKey) => {
    return store.decoded[pointer] === void 0 && !isSimple(pointerKey);
};

const explorePointer = (store, pointer) => {
    const pointerKey = pointer.substring(0, 2);

    if (!isExplorable(store, pointer, pointerKey)) {
        return;
    }

    const dataItem = {
        key: pointerKey,
        index: parseInt(pointer.substring(2), 10),
        pointer: pointer,
        value: void 0,
        built: [],
        parts: [],
    };

    store.decoded[pointer] = dataItem;

    dataItem.value = types[pointerKey].generateReference(store, dataItem.index);
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


module.exports = (encoded) => {
    const store = {
        encoded: encoded.reduce((accumulator, e) => {
            accumulator[e[0]] = e[1];
            return accumulator;
        }, {}),
        decoded: {},
        explore: [],
    };

    const rootPointerKey = store.encoded.r.substring(0, 2);

    if ((types[rootPointerKey] || {}).simple) {
        return types[rootPointerKey].generate();
    }

    store.explore.push(store.encoded.r);
    while (store.explore.length) {
        explorePointer(store, store.explore.shift());
    }

    Object.values(store.decoded).forEach((dataItem) => {
        types[dataItem.key].build(store, dataItem);
    });

    return store.decoded[store.encoded.r].value;
};
