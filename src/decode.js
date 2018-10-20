const keysSimple = require('./utils/keysSimple.js');
const keysComposite = require('./utils/keysComposite.js');
const functionDecoder = require('./utils/functionDecoder.js');
const standardErrors = require('./utils/standardErrors.js');

const genDecodePointer = (pointer) => {
    return {
        k: pointer.substring(0, 2),
        i: parseInt(pointer.substring(2), 10),
        p: pointer,
    };
};

const getEncodedAt = (data, key, index) => {
    return data._[key][index];
};

const getEncodedAtPointer = (data, pointer) => {
    return getEncodedAt(data, pointer.substring(0, 2), parseInt(pointer.substring(2), 10));
};

const genValueOf = (data, p) => {
    const vp = genDecodePointer(getEncodedAt(data, p.k, p.i)[0]);
    return types[vp.k].g(data, vp);
};

const containerGenerator = (data, p) => {
    let pairs = getEncodedAt(data, p.k, p.i);

    // Create the container object into which things will be assigned below
    data[p.k][p.i] = types[p.k].n(data, p);

    // Skip the first item if the data's value had to be encoded with other values
    if (keysComposite[p.k]) {
        pairs = pairs.slice(1);
    }

    pairs.forEach((pair, index) => {
        // p.k !== 'ar' &&
        if (pair.length === 1) {
            data[p.k][p.i][index] = generate(data, pair[0]);
        }
        else {
            data[p.k][p.i][generate(data, pair[0])] = generate(data, pair[1]);
        }
    });

    return data[p.k][p.i];
};

const generate = (data, pointer) => {
    const p = genDecodePointer(pointer);

    // Simple PointerKeys are their own Pointers
    if (keysSimple[p.k]) {
        return types[p.k].g(data, p);
    }

    // Ensure that the value storage list exists
    data[p.k] = data[p.k] || [];

    if (data[p.k][p.i] !== void 0) {
        // Return any value that exists at the Pointer location
        return data[p.k][p.i];
    }

    return types[p.k] === void 0 ? p.p : types[p.k].g(data, p);
};

const genTypeArrayGenerator = (type) => {
    return {
        g: containerGenerator,
        n: (data, p) => {
            return new type(getEncodedAt(data, p.k, p.i)[0].map((pointer) => {
                return getEncodedAtPointer(data, pointer);
            }));
        },
    };
};

const genArrayBufferGenerator = (type) => {
    return {
        g: containerGenerator,
        n: (data, p) => {
            const encodedValues = getEncodedAt(data, p.k, p.i)[0];
            const buffer = new type(encodedValues.length);
            const view = new Uint8Array(buffer);
            encodedValues.forEach((pointer, index) => {
                view[index] = getEncodedAtPointer(data, pointer);
            });
            return buffer;
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
    const encodedValues = getEncodedAt(data, p.k, p.i)[0];

    return new Blob([new Uint8Array(getEncodedAtPointer(data, encodedValues[0])[0].map((item) => {
        return getEncodedAtPointer(data, item);
    }))], {
        type: getEncodedAtPointer(data, encodedValues[1]),
    });
};

/* istanbul ignore next */
const genFile = (data, p) => {
    const encodedValues = getEncodedAt(data, p.k, p.i)[0];

    return new File([new Uint8Array(getEncodedAtPointer(data, encodedValues[0])[0].map((item) => {
        return getEncodedAtPointer(data, item);
    }))], getEncodedAtPointer(data, encodedValues[1]), {
        type: getEncodedAtPointer(data, encodedValues[2]),
        lastModified: getEncodedAtPointer(data, encodedValues[3]),
    });
};

const types = {
    'un': { g: () => { return void 0; } },
    'nl': { g: () => { return null; } },
    'bt': { g: () => { return true; } },
    'bf': { g: () => { return false; } },
    'na': { g: () => { return NaN; } },
    '-i': { g: () => { return -Infinity; } },
    '+i': { g: () => { return Infinity; } },
    'n0': { g: () => { return -0; } },
    'nm': {
        g: (data, p) => {
            return getEncodedAt(data, p.k, p.i);
        },
    },
    'st': {
        g: (data, p) => {
            return getEncodedAt(data, p.k, p.i);
        },
    },
    're': {
        g: containerGenerator,
        n: (data, p) => {
            const encodedValues = getEncodedAt(data, p.k, p.i)[0];
            const value = new RegExp(getEncodedAtPointer(data, encodedValues[0]), getEncodedAtPointer(data, encodedValues[1]));
            value.lastIndex = getEncodedAtPointer(data, encodedValues[2]);

            return value;
        },
    },
    'sy': {
        g: (data, p) => {
            // Manually decode the array container format
            const encodedValues = getEncodedAt(data, p.k, p.i);
            const name = getEncodedAtPointer(data, encodedValues[1]);

            data[p.k][p.i] = getEncodedAtPointer(data, encodedValues[0]) === 1 ? Symbol.for(name) : Symbol(name);

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
            const encodedValues = getEncodedAt(data, p.k, p.i)[0];

            const value = new (standardErrors[getEncodedAtPointer(data, encodedValues[0])] || Error)(getEncodedAtPointer(data, encodedValues[1]));
            value.stack = getEncodedAtPointer(data, encodedValues[2]);

            return value;
        },
    },
    'ag': {
        g: containerGenerator,
        n: (data, p) => {
            // Generating Arguments object with the correct length
            // If the argument count isn't set initially, setting the index values on an Arguments object will add them as String keys
            return (function() {
                return arguments;
            }).apply(null, Array.from({
                length: getEncodedAt(data, p.k, p.i).findIndex((item) => {
                    return item.length !== 1;
                }),
            }, () => {}));
        },
    },
    'ar': {
        g: containerGenerator,
        n: (data, p) => {
            return [];
        },
    },
    'ob': {
        g: containerGenerator,
        n: () => {
            return {};
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
    'AB': genArrayBufferGenerator(ArrayBuffer),
    'SA': genArrayBufferGenerator(SharedArrayBuffer),
    'Se': {
        g: containerGenerator,
        n: (data, p) => {
            return new Set(getEncodedAt(data, p.k, p.i)[0].map((item) => {
                return generate(data, item);
            }));
        },
    },
    'Ma': {
        g: containerGenerator,
        n: (data, p) => {
            return new Map(getEncodedAt(data, p.k, p.i)[0].map((item) => {
                return [
                    generate(data, item[0]),
                    generate(data, item[1]),
                ];
            }));
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
    const data = {
        // Encoded Data
        _: encodedData.reduce((accumulator, item) => {
            accumulator[item[0]] = item[1];
            return accumulator;
        }, {}),
    };

    // Create PointerItem from root
    return generate(data, data._.r);
};
