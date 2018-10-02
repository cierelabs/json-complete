const pointers = require('./pointers.js');

const genEmptyFromPointerKey = (pointerKey) => {
    if (pointerKey === 'ob') {
        return {};
    }

    if (pointerKey === 'ar') {
        return [];
    }

    // TODO
};

const tryAddPointerToExploreQueue = (data, pointer) => {
    // Only add to the exploreQueue if it hasn't already been created
    if ((data[pointers.extractPointerKey(pointer)] || [])[pointers.extractPointerIndex(pointer)] === void 0) {
        data._.exploreQueue.push(pointer);
    }
};

const tryGetContainerValue = (source, pointer) => {
    const pointerKey = pointers.extractPointerKey(pointer);
    const pointerIndex = pointers.extractPointerIndex(pointer);

    // Ensure the ref list exists
    source[pointerKey] = source[pointerKey] || [];

    // Ensure the ref item exists
    if (source[pointerKey][pointerIndex] === void 0) {
        source[pointerKey][pointerIndex] = genEmptyFromPointerKey(pointerKey);
    }

    return source[pointerKey][pointerIndex];
};

const basicGenerator = (data, pointer) => {
    return data._.encoded[pointers.extractPointerKey(pointer)][pointers.extractPointerIndex(pointer)];
};

const containerGenerator = (data, pointer) => {
    const container = tryGetContainerValue(data, pointer);

    tryGetContainerValue(data._.encoded, pointer).forEach((pair) => {
        if (pointers.isContainerPointerKey(pointers.extractPointerKey(pair[1]))) {
            tryAddPointerToExploreQueue(data, pair[1]);
            container[generate(data, pair[0])] = tryGetContainerValue(data, pair[1]);
        }
        else {
            container[generate(data, pair[0])] = generate(data, pair[1]);
        }
    });
};

const decodeValueIntoData = (data, pointer, generateCallback) => {
    const pointerKey = pointers.extractPointerKey(pointer);
    const pointerIndex = pointers.extractPointerIndex(pointer);

    const decodedValue = generate(data, data._.encoded[pointerKey][pointerIndex]);
    const value = generateCallback(decodedValue);

    data[pointerKey][pointerIndex] = value;
    return value;
};

const generators = {
    'un': () => {
        return void 0;
    },
    'nl': () => {
        return null;
    },
    'Bt': () => {
        return true;
    },
    'Bf': () => {
        return false;
    },
    'Na': () => {
        return NaN;
    },
    '-I': () => {
        return -Infinity;
    },
    '+I': () => {
        return Infinity;
    },
    '-0': () => {
        return -0;
    },
    'nm': basicGenerator,
    'st': basicGenerator,
    're': (data, pointer) => {
        const pointerKey = pointers.extractPointerKey(pointer);
        const pointerIndex = pointers.extractPointerIndex(pointer);

        // Manually decode the array container format
        const regexArray = tryGetContainerValue(data._.encoded, data._.encoded[pointerKey][pointerIndex]);
        if (regexArray.length !== 3) {
            throw `Incorrectly constructed Regular Expression data at pointer ${pointer}`;
        }

        const source = basicGenerator(data, regexArray[0][1]);
        const flags = basicGenerator(data, regexArray[1][1]);
        const lastIndex = basicGenerator(data, regexArray[2][1]);

        const value = new RegExp(source, flags);
        value.lastIndex = lastIndex;

        data[pointerKey][pointerIndex] = value;
        return value;
    },
    'da': (data, pointer) => {
        return decodeValueIntoData(data, pointer, (decodedValue) => {
            return new Date(decodedValue);
        });
    },
    'sy': (data, pointer) => {
        return decodeValueIntoData(data, pointer, (decodedValue) => {
            return decodedValue === 0 ? Symbol() : Symbol.for(decodedValue);
        });
    },
    'fu': (data, pointer) => {
        return decodeValueIntoData(data, pointer, (decodedValue) => {
            try {
                const box = {};
                eval(`box.fn = ${decodedValue};`);
                return box.fn;
            }
            catch (e) {
                // If it was an error, then it's possible that the item was a Method Function
                if (e instanceof SyntaxError) {
                    let box = {};
                    eval(`box = { ${decodedValue} };`);
                    const key = decodedValue.match(/\s*([^\s(]+)\s*\(/)[1];
                    return box[key];
                }
            }
        });
    },
    'ob': containerGenerator,
    'ar': containerGenerator,
};

const generate = (data, pointer) => {
    const pointerKey = pointers.extractPointerKey(pointer);

    // Containers values need to handle their own existing Pointer handling
    if (!pointers.isContainerPointerKey(pointerKey)) {
        // Simple PointerKeys are their own Pointers
        if (pointers.isSimplePointerKey(pointerKey)) {
            return generators[pointerKey]();
        }

        // Ensure ref list exists
        data[pointerKey] = data[pointerKey] || [];
        const existingValue = data[pointerKey][pointers.extractPointerIndex(pointer)];

        // If found, return its existing value
        if (existingValue !== void 0) {
            return existingValue;
        }
    }

    return generators[pointerKey] === void 0 ? pointer : generators[pointerKey](data, pointer);
};

module.exports = (encoded) => {
    const data = {
        _: {
            encoded: encoded,
            exploreQueue: [],
        },
    };

    // If root value is a not a container, return its value directly
    if (!pointers.isContainerPointerKey(pointers.extractPointerKey(encoded.root))) {
        return generate(data, encoded.root);
    }

    data._.exploreQueue.push(encoded.root);

    var temp = 1000;

    while (data._.exploreQueue.length > 0 && temp--) {
        const pointer = data._.exploreQueue.shift();

        // Sanity checks
        const pointerKey = pointers.extractPointerKey(pointer);
        if (pointers.isSimplePointerKey(pointerKey)) {
            // Should never happen
            throw `Simple PointerKey was added to the exploreQueue, incorrectly. Pointer: ${pointer}`;
        }
        if (pointers.isValuePointerKey(pointerKey)) {
            // Should never happen
            throw `Value PointerKey was added to the exploreQueue, incorrectly. Pointer: ${pointer}`;
        }
        if (!pointers.isContainerPointerKey(pointerKey)) {
            // Should never happen
            throw `Unrecognized PointerKey type was added to the exploreQueue, incorrectly. Pointer: ${pointer}`;
        }

        generate(data, pointer);
    }

    return data[pointers.extractPointerKey(encoded.root)][pointers.extractPointerIndex(encoded.root)];
};
