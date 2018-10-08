const pointers = require('./utils/pointers.js');
const genDecodePointer = require('./utils/genDecodePointer.js');

const getOrCreateContainer = (data, p) => {
    // Ensure the ref list exists
    data[p.k] = data[p.k] || [];

    // Ensure the ref item exists
    if (data[p.k][p.i] === void 0) {
        data[p.k][p.i] = types[p.k].n(data, p);
    }

    return data[p.k][p.i];
};

const getP = (data, p) => {
    return data._.encoded[p.k][p.i];
};

const getEncodedValueOf = (data, p) => {
    const vp = genDecodePointer(getP(data, p)[0][1]);
    return types[vp.k].g(data, vp);
};

const containerGenerator = (data, p) => {
    const container = getOrCreateContainer(data, p);

    let pairs = getP(data, p);

    // First key is null, that was the valueOf, ignore
    if ((pairs[0] || [])[0] === 'nl') {
        pairs = Array.prototype.slice.call(pairs, 1);
    }

    Array.prototype.forEach.call(pairs, (pair) => {
        const pk = genDecodePointer(pair[0]);
        const pv = genDecodePointer(pair[1]);

        if (pointers.isContainerPointerKey(pv.k)) {
            // Only add to the exploreQueue if it hasn't already been created
            if ((data[pv.k] || [])[pv.i] === void 0) {
                Array.prototype.push.call(data._.exploreQueue, pv);
            }
            container[generate(data, pk)] = getOrCreateContainer(data, pv);
        }
        else {
            container[generate(data, pk)] = generate(data, pv);
        }
    });

    return container;
};

const generate = (data, p) => {
    // Containers values need to handle their own existing Pointer handling
    if (!pointers.isContainerPointerKey(p.k)) {
        // Simple PointerKeys are their own Pointers
        if (pointers.isSimplePointerKey(p.k)) {
            return types[p.k].g(data, p);
        }

        // Ensure ref list exists
        data[p.k] = data[p.k] || [];
        const existingValue = data[p.k][p.i];

        // If found, return its existing value
        if (existingValue !== void 0) {
            return existingValue;
        }
    }

    return types[p.k] === void 0 ? p.p : types[p.k].g(data, p);
};

const types = {
    'un': {
        g: () => {
            return void 0;
        }
    },
    'nl': {
        g: () => {
            return null;
        }
    },
    'bt': {
        g: () => {
            return true;
        }
    },
    'bf': {
        g: () => {
            return false;
        }
    },
    'na': {
        g: () => {
            return NaN;
        }
    },
    '-i': {
        g: () => {
            return -Infinity;
        }
    },
    '+i': {
        g: () => {
            return Infinity;
        }
    },
    'n0': {
        g: () => {
            return -0;
        }
    },
    'nm': {
        g: getP,
    },
    'st': {
        g: getP,
    },
    're': {
        g: containerGenerator,
        n: (data, p) => {
            const encodedArray = getP(data, genDecodePointer(getP(data, p)[0][1]));
            const value = new RegExp(getP(data, genDecodePointer(encodedArray[0][1])), getP(data, genDecodePointer(encodedArray[1][1])));
            value.lastIndex = getP(data, genDecodePointer(encodedArray[2][1]));

            return value;
        },
    },
    'da': {
        g: containerGenerator,
        n: (data, p) => {
            return new Date(getEncodedValueOf(data, p));
        },
    },
    'sy': {
        g: (data, p) => {
            // Manually decode the array container format
            const valueArray = getP(data, genDecodePointer(getP(data, p)));

            const type = getP(data, genDecodePointer(valueArray[0][1]));
            const name = getP(data, genDecodePointer(valueArray[1][1]));

            data[p.k][p.i] = type === 1 ? Symbol.for(name) : Symbol(name);

            return data[p.k][p.i];
        },
    },
    'fu': {
        g: containerGenerator,
        n: (data, p) => {
            const decodedValue = getEncodedValueOf(data, p);

            let box = {};

            try {
                eval(`box.fn = ${decodedValue};`);
                return box.fn;
            }
            catch (e) {
                // If it was an error, then it's possible that the item was a Method Function
                if (e instanceof SyntaxError) {
                    eval(`box = { ${decodedValue} };`);
                    const key = String.prototype.match.call(decodedValue, /\s*([^\s(]+)\s*\(/)[1];
                    return box[key];
                }
            }
        },
    },
    'ob': {
        g: containerGenerator,
        n: () => {
            return {};
        },
    },
    'ar': {
        g: containerGenerator,
        n: () => {
            return [];
        },
    },
    'BO': {
        g: containerGenerator,
        n: (data, p) => {
            return new Boolean(getEncodedValueOf(data, p));
        },
    },
    'NM': {
        g: containerGenerator,
        n: (data, p) => {
            return new Number(getEncodedValueOf(data, p));
        },
    },
    'ST': {
        g: containerGenerator,
        n: (data, p) => {
            return new String(getEncodedValueOf(data, p));
        },
    },
    'I1': {
        g: containerGenerator,
        n: (data, p) => {
            return new Int8Array(getP(data, p).length);
        },
    },
    'U1': {
        g: containerGenerator,
        n: (data, p) => {
            return new Uint8Array(getP(data, p).length);
        },
    },
    'C1': {
        g: containerGenerator,
        n: (data, p) => {
            return new Uint8ClampedArray(getP(data, p).length);
        },
    },
    'I2': {
        g: containerGenerator,
        n: (data, p) => {
            return new Int16Array(getP(data, p).length);
        },
    },
    'U2': {
        g: containerGenerator,
        n: (data, p) => {
            return new Uint16Array(getP(data, p).length);
        },
    },
    'I3': {
        g: containerGenerator,
        n: (data, p) => {
            return new Int32Array(getP(data, p).length);
        },
    },
    'U3': {
        g: containerGenerator,
        n: (data, p) => {
            return new Uint32Array(getP(data, p).length);
        },
    },
    'F3': {
        g: containerGenerator,
        n: (data, p) => {
            return new Float32Array(getP(data, p).length);
        },
    },
    'F4': {
        g: containerGenerator,
        n: (data, p) => {
            return new Float64Array(getP(data, p).length);
        },
    },
};

module.exports = (encoded) => {
    // Convert encoded array into encoded object
    const encodedObj = {};
    Array.prototype.forEach.call(encoded, (pair) => {
        encodedObj[pair[0]] = pair[1];
    });

    const data = {
        _: {
            encoded: encodedObj,
            exploreQueue: [],
        },
    };

    const rp = genDecodePointer(data._.encoded.r);

    // If root value is a not a container, return its value directly
    if (!pointers.isContainerPointerKey(rp.k)) {
        return generate(data, rp);
    }

    Array.prototype.push.call(data._.exploreQueue, rp);

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
