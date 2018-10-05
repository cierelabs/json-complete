const pointers = require('./utils/pointers.js');
const genDecodePointer = require('./utils/genDecodePointer.js');

const getOrCreateContainer = (data, p) => {
    // Ensure the ref list exists
    data[p.k] = data[p.k] || [];

    // Ensure the ref item exists
    if (data[p.k][p.i] === void 0) {
        if (p.k === 'ob') {
            data[p.k][p.i] = {};
        }

        if (p.k === 'ar') {
            data[p.k][p.i] = [];
        }

        if (p.k === 'da') {
            const pairs = getEncoded(data, p);
            const decodedValue = getEncoded(data, genDecodePointer(pairs[0][1]));
            data[p.k][p.i] = new Date(decodedValue);
        }

        if (p.k === 'fu') {
            const pairs = getEncoded(data, p);
            const decodedValue = getEncoded(data, genDecodePointer(pairs[0][1]));

            try {
                const box = {};
                eval(`box.fn = ${decodedValue};`);
                data[p.k][p.i] = box.fn;
            }
            catch (e) {
                // If it was an error, then it's possible that the item was a Method Function
                if (e instanceof SyntaxError) {
                    let box = {};
                    eval(`box = { ${decodedValue} };`);
                    const key = decodedValue.match(/\s*([^\s(]+)\s*\(/)[1];
                    data[p.k][p.i] = box[key];
                }
            }
        }
    }

    return data[p.k][p.i];
};

const getEncoded = (data, p) => {
    return data._.encoded[p.k][p.i];
};

const containerGenerator = (data, p) => {
    const container = getOrCreateContainer(data, p);

    let pairs = getEncoded(data, p);

    // First key is null, that was the valueOf, ignore
    if ((pairs[0] || [])[0] === 'nl') {
        pairs = pairs.slice(1);
    }

    Array.prototype.forEach.call(pairs, (pair) => {
        const pk = genDecodePointer(pair[0]);
        const pv = genDecodePointer(pair[1]);

        if (pointers.isContainerPointerKey(pv.k)) {
            // Only add to the exploreQueue if it hasn't already been created
            if ((data[pv.k] || [])[pv.i] === void 0) {
                data._.exploreQueue.push(pv);
            }
            container[generate(data, pk)] = getOrCreateContainer(data, pv);
        }
        else {
            container[generate(data, pk)] = generate(data, pv);
        }
    });

    return container;
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
    'nm': getEncoded,
    'st': getEncoded,
    're': (data, p) => {
        // Manually decode the array container format
        const regexArray = getEncoded(data, genDecodePointer(getEncoded(data, p)));
        if (regexArray.length !== 3) {
            throw `Incorrectly constructed Regular Expression data at pointer ${p.p}`;
        }

        const source = getEncoded(data, genDecodePointer(regexArray[0][1]));
        const flags = getEncoded(data, genDecodePointer(regexArray[1][1]));
        const lastIndex = getEncoded(data, genDecodePointer(regexArray[2][1]));

        const value = new RegExp(source, flags);
        value.lastIndex = lastIndex;

        data[p.k][p.i] = value;
        return value;
    },
    'da': containerGenerator,
    'sy': (data, p) => {
        // Manually decode the array container format
        const valueArray = getEncoded(data, genDecodePointer(getEncoded(data, p)));

        const type = getEncoded(data, genDecodePointer(valueArray[0][1]));
        const name = getEncoded(data, genDecodePointer(valueArray[1][1]));

        data[p.k][p.i] = type === 1 ? Symbol.for(name) : Symbol(name);

        return data[p.k][p.i];
    },
    'fu': containerGenerator,
    'ob': containerGenerator,
    'ar': containerGenerator,
};

const generate = (data, p) => {
    // Containers values need to handle their own existing Pointer handling
    if (!pointers.isContainerPointerKey(p.k)) {
        // Simple PointerKeys are their own Pointers
        if (pointers.isSimplePointerKey(p.k)) {
            return generators[p.k]();
        }

        // Ensure ref list exists
        data[p.k] = data[p.k] || [];
        const existingValue = data[p.k][p.i];

        // If found, return its existing value
        if (existingValue !== void 0) {
            return existingValue;
        }
    }

    return generators[p.k] === void 0 ? p.p : generators[p.k](data, p);
};

module.exports = (encoded) => {
    const data = {
        _: {
            encoded: encoded,
            exploreQueue: [],
        },
    };

    const rp = genDecodePointer(encoded.root);

    // If root value is a not a container, return its value directly
    if (!pointers.isContainerPointerKey(rp.k)) {
        return generate(data, rp);
    }

    data._.exploreQueue.push(rp);

    var temp = 1000;

    while (data._.exploreQueue.length > 0 && temp--) {
        const p = data._.exploreQueue.shift();

        // Sanity checks
        if (pointers.isSimplePointerKey(p.k)) {
            // Should never happen
            throw `Simple PointerKey was added to the exploreQueue, incorrectly. Pointer: ${p.p}`;
        }
        if (pointers.isValuePointerKey(p.k)) {
            // Should never happen
            throw `Value PointerKey was added to the exploreQueue, incorrectly. Pointer: ${p.p}`;
        }
        if (!pointers.isContainerPointerKey(p.k)) {
            // Should never happen
            throw `Unrecognized PointerKey type was added to the exploreQueue, incorrectly. Pointer: ${p.p}`;
        }

        generate(data, p);
    }

    return data[rp.k][rp.i];
};
