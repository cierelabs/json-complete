const isContainerPointerKey = require('./utils/isContainerPointerKey.js');
const isSimplePointerKey = require('./utils/isSimplePointerKey.js');
const isCompositePointerKey = require('./utils/isCompositePointerKey.js');
const functionDecoder = require('./utils/functionDecoder.js');

const genDecodePointer = (pointer) => {
    return {
        k: pointer.substring(0, 2),
        i: pointer.length <= 2 ? -1 : parseInt(pointer.substring(2), 10),
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
    const vp = genDecodePointer(getP(data, p)[0]);
    return types[vp.k].g(data, vp);
};

const tryEnqueuePointerItem = (data, p) => {
    if ((data[p.k] || [])[p.i] === void 0) {
        data.q.push(p);
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
    const offset = isCompositePointerKey(p.k) ? 1 : 0;

    const pairsLength = pairs.length;
    for (let i = 0; i < pairsLength - offset; i += 1) {
        const pair = pairs[i + offset];
        if (pair.length === 1) {
            container[i] = genContainerPart(data, pair[0]);
            continue;
        }
        container[genContainerPart(data, pair[0])] = genContainerPart(data, pair[1]);
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
            const numberArray = [];
            getP(data, p)[0].forEach((pointer) => {
                numberArray.push(getP(data, genDecodePointer(pointer)));
            });
            return new type(numberArray);
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

/* istanbul ignore next */
const genBlob = (data, p) => {
    const encodedArray = getP(data, p)[0];
    const type = getP(data, genDecodePointer(encodedArray[1]));

    const dataArray = []
    getP(data, genDecodePointer(encodedArray[0]))[0].forEach((item) => {
        dataArray.push(getP(data, genDecodePointer(item)));
    });

    return new Blob([new Uint8Array(dataArray)], {
        type: type,
    });
};

/* istanbul ignore next */
const genFile = (data, p) => {
    const encodedArray = getP(data, p)[0];
    const name = getP(data, genDecodePointer(encodedArray[1]));
    const type = getP(data, genDecodePointer(encodedArray[2]));
    const lastModified = getP(data, genDecodePointer(encodedArray[3]));

    const dataArray = []
    getP(data, genDecodePointer(encodedArray[0]))[0].forEach((item) => {
        dataArray.push(getP(data, genDecodePointer(item)));
    });

    return new File([new Uint8Array(dataArray)], name, {
        type: type,
        lastModified: lastModified,
    });
};

const types = {
    'un': genIdentityGenerator(undefined),
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
            const encodedArray = getP(data, p)[0];
            const value = new RegExp(getP(data, genDecodePointer(encodedArray[0])), getP(data, genDecodePointer(encodedArray[1])));
            value.lastIndex = getP(data, genDecodePointer(encodedArray[2]));

            return value;
        },
    },
    'sy': {
        g: (data, p) => {
            // Manually decode the array container format
            const encodedArray = getP(data, p);

            const type = getP(data, genDecodePointer(encodedArray[0]));
            const name = getP(data, genDecodePointer(encodedArray[1]));

            data[p.k][p.i] = type === 1 ? Symbol.for(name) : Symbol(name);

            return data[p.k][p.i];
        },
    },
    'fu': {
        g: containerGenerator,
        n: (data, p) => {
            return functionDecoder(genValueOf(data, p));
        },
    },
    'er': {
        g: containerGenerator,
        n: (data, p) => {
            const encodedArray = getP(data, p)[0];

            const type = getP(data, genDecodePointer(encodedArray[0]));
            const message = getP(data, genDecodePointer(encodedArray[1]));
            const stack = getP(data, genDecodePointer(encodedArray[2]));

            let value;

            if (type === 'EvalError') {
                value = new EvalError(message);
            }
            else if (type === 'RangeError') {
                value = new RangeError(message);
            }
            else if (type === 'ReferenceError') {
                value = new ReferenceError(message);
            }
            else if (type === 'SyntaxError') {
                value = new SyntaxError(message);
            }
            else if (type === 'TypeError') {
                value = new TypeError(message);
            }
            else if (type === 'URIError') {
                value = new URIError(message);
            }
            else {
                value = new Error(message);
            }

            value.stack = stack;

            return value;
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
            const encodedArray = getP(data, p)[0];
            const decodedArray = [];
            for (let a = 0; a < encodedArray.length; a += 1) {
                decodedArray.push(genContainerPart(data, encodedArray[a]));
            }
            return new Set(decodedArray);
        },
    },
    'Ma': {
        g: containerGenerator,
        n: (data, p) => {
            const encodedArray = getP(data, p)[0];
            const decodedArray = [];
            for (let a = 0; a < encodedArray.length; a += 1) {
                const pairArray = encodedArray[a];
                decodedArray.push([
                    genContainerPart(data, pairArray[0]),
                    genContainerPart(data, pairArray[1]),
                ]);
            }
            return new Map(decodedArray);
        },
    },
    'Bl': {
        g: containerGenerator,
        n: genBlob,
    },
    'Fi': {
        g: containerGenerator,
        n: genFile,
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
    data.q.push(rp);

    while (data.q.length > 0) {
        generate(data, data.q.shift());
    }

    return data[rp.k][rp.i];
};
