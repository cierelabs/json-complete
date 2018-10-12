const isContainerPointerKey = require('./utils/isContainerPointerKey.js');
const isSimplePointerKey = require('./utils/isSimplePointerKey.js');
const isValueContainerKey = require('./utils/isValueContainerKey.js');

const forEach = Array.prototype.forEach;
const match = String.prototype.match;
const push = Array.prototype.push;
const shift = Array.prototype.shift;
const substring = String.prototype.substring;

// Doesn't provide much protection, only prevents an evaluation from affecting the ongoing decoding process
const functionIsolatorReference = function functionIsolator(functionString) {
    try {
        eval(`functionIsolator.b = ${functionString};`);
        return functionIsolator.b;
    }
    catch (e) {
        // If it was an error, then it's possible that the item was a Method Function
        eval(`functionIsolator.b = { ${functionString} };`);
        return functionIsolator.b[match.call(functionString, /\s*([^\s(]+)\s*\(/)[1]];
    }
}

const genDecodePointer = (pointer) => {
    return {
        k: substring.call(pointer, 0, 2),
        i: pointer.length <= 2 ? -1 : parseInt(substring.call(pointer, 2), 10),
        p: pointer,
    };
};

const getExisting = (data, p) => {
    // Simple PointerKeys are their own Pointers
    if (isSimplePointerKey(p.k)) {
        return types[p.k].g(data, p);
    }

    // Ensure that the value storage list exists
    data[p.k] = data[p.k] || [];

    // Return any value that exists at the Pointer location
    return data[p.k][p.i];
};

const getExistingOrCreate = (data, p) => {
    const ref = getExisting(data, p);

    // If the ref found, return it
    if (ref !== void 0) {
        return ref;
    }

    // If it doesn't exist, create it and store it
    data[p.k][p.i] = types[p.k].n(data, p);
    return data[p.k][p.i];
};

const getP = (data, p) => {
    return data.e[p.k][p.i];
};

const genValueOf = (data, p) => {
    const vp = genDecodePointer(getP(data, p)[0][1]);
    return types[vp.k].g(data, vp);
};

const tryEnqueuePointerItem = (data, p) => {
    if ((data[p.k] || [])[p.i] === void 0) {
        push.call(data.q, p);
    }
};

const genContainerPart = (data, pointer) => {
    const p = genDecodePointer(pointer);

    if (isContainerPointerKey(p.k)) {
        tryEnqueuePointerItem(data, p);
        return getExistingOrCreate(data, p);
    }
    else {
        return generate(data, p);
    }
};

const containerGenerator = (data, p) => {
    let pairs = getP(data, p);

    const container = getExistingOrCreate(data, p);

    // Skip the first item if the data's value had to be encoded with other values
    // These items have null keys
    let i = isValueContainerKey(p.k) ? 1 : 0;

    const pairLength = pairs.length;
    for (; i < pairLength; i += 1) {
        container[genContainerPart(data, pairs[i][0])] = genContainerPart(data, pairs[i][1]);
    }

    return container;
};

const generate = (data, p) => {
    // Containers values need to handle their own existing Pointer handling
    if (!isContainerPointerKey(p.k)) {
        const existingValue = getExisting(data, p);
        if (existingValue !== void 0) {
            return existingValue;
        }
    }

    return types[p.k] === void 0 ? p.p : types[p.k].g(data, p);
};

const genIdentityGenerator = (v) => {
    return {
        g: () => {
            return v;
        },
    }
};

const genTypeArrayGenerator = (type) => {
    return {
        g: containerGenerator,
        n: (data, p) => {
            return new type(getP(data, p).length);
        },
    };
};

const genValueObjectGenerator = (type) => {
    return {
        g: containerGenerator,
        n: (data, p) => {
            return new type(genValueOf(data, p));
        },
    };
}

const types = {
    'un': genIdentityGenerator(void 0),
    'nl': genIdentityGenerator(null),
    'bt': genIdentityGenerator(true),
    'bf': genIdentityGenerator(false),
    'na': genIdentityGenerator(Number.NaN),
    '-i': genIdentityGenerator(Number.NEGATIVE_INFINITY),
    '+i': genIdentityGenerator(Number.POSITIVE_INFINITY),
    'n0': genIdentityGenerator(-0),
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
            delete functionIsolatorReference.b;
            return functionIsolatorReference(genValueOf(data, p));
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
    'da': genValueObjectGenerator(Date),
    'BO': genValueObjectGenerator(Boolean),
    'NM': genValueObjectGenerator(Number),
    'ST': genValueObjectGenerator(String),
    'I1': genTypeArrayGenerator(Int8Array),
    'U1': genTypeArrayGenerator(Uint8Array),
    'C1': genTypeArrayGenerator(Uint8ClampedArray),
    'I2': genTypeArrayGenerator(Int16Array),
    'U2': genTypeArrayGenerator(Uint16Array),
    'I3': genTypeArrayGenerator(Int32Array),
    'U3': genTypeArrayGenerator(Uint32Array),
    'F3': genTypeArrayGenerator(Float32Array),
    'F4': genTypeArrayGenerator(Float64Array),
    'Se': {
        g: containerGenerator,
        n: (data, p) => {
            const encodedArray = getP(data, genDecodePointer(getP(data, p)[0][1]));
            const decodedArray = [];
            for (let a = 0; a < encodedArray.length; a += 1) {
                push.call(decodedArray, genContainerPart(data, encodedArray[a][1]));
            }
            return new Set(decodedArray);
        },
    },
    'Ma': {
        g: containerGenerator,
        n: (data, p) => {
            const encodedArray = getP(data, genDecodePointer(getP(data, p)[0][1]));
            const decodedArray = [];
            for (let a = 0; a < encodedArray.length; a += 1) {
                const pairArray = getP(data, genDecodePointer(encodedArray[a][1]));
                push.call(decodedArray, [
                    genContainerPart(data, pairArray[0][1]),
                    genContainerPart(data, pairArray[1][1]),
                ]);
            }
            return new Map(decodedArray);
        },
    },
    'Bl': {
        g: containerGenerator,
        n: /* istanbul ignore next */ (data, p) => {
            const encodedArray = getP(data, genDecodePointer(getP(data, p)[0][1]));
            const type = getP(data, genDecodePointer(encodedArray[1][1]));

            const options = type === 0 ? void 0 : {
                type: type,
            };

            const dataArray = []
            forEach.call(getP(data, genDecodePointer(encodedArray[0][1])), (item) => {
                push.call(dataArray, getP(data, genDecodePointer(item[1])));
            });

            return new Blob([new Uint8Array(dataArray)], options);
        },
    },
};

module.exports = (encodedData) => {
    const encodedDataObj = {};
    for (let e = 0; e < encodedData.length; e += 1) {
        encodedDataObj[encodedData[e][0]] = encodedData[e][1];
    }

    const data = {
        q: [], // Exploration Queue
        e: encodedDataObj, // Encoded Data
    };

    // Create PointerItem from root
    const rp = genDecodePointer(data.e.r);

    // If root value is a not a container, return its value directly
    if (!isContainerPointerKey(rp.k)) {
        return generate(data, rp);
    }

    // Prep the Exploration Queue to explore from the root
    push.call(data.q, rp);

    while (data.q.length > 0) {
        generate(data, shift.call(data.q));
    }

    return data[rp.k][rp.i];
};
