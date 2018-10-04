const simpleKeys = {
    'un': 1, // undefined
    'nl': 1, // null
    'Bt': 1, // true
    'Bf': 1, // false
    'Na': 1, // NaN
    '-I': 1, // -Infinity
    '+I': 1, // Infinity
    '-0': 1, // -0
};

const isSimplePointerKey = (pointerKey) => {
    return Boolean(simpleKeys[pointerKey]);
};

const valueKeys = {
    'nm': 1, // number
    'st': 1, // string
    're': 1, // regex
    'da': 1, // date
    'sy': 1, // symbol
    'fu': 1, // function
    'Fi': 1, // File
    'Bl': 1, // Blob
};

const isValuePointerKey = (pointerKey) => {
    return Boolean(valueKeys[pointerKey]);
};

const containerKeys = {
    'ob': 1, // object
    'ar': 1, // array
    'I1': 1, // Int8Array
    'U1': 1, // Uint8Array
    'C1': 1, // Uint8ClampedArray
    'I2': 1, // Int16Array
    'U2': 1, // Uint16Array
    'I3': 1, // Int32Array
    'U3': 1, // Uint32Array
    'F3': 1, // Float32Array
    'F4': 1, // Float64Array
    'AB': 1, // ArrayBuffer
    'Ma': 1, // Map
    'Se': 1, // Set
    'WM': 1, // WeakMap
    'WS': 1, // WeakSet
};

const isContainerPointerKey = (pointerKey) => {
    return Boolean(containerKeys[pointerKey]);
};

const typeNameMap = {
    '[object Array]': 'ar',
    '[object Date]': 'da',
    '[object Function]': 'fu',
    '[object Null]': 'nl',
    '[object Number]': 'nm',
    '[object Object]': 'ob',
    '[object RegExp]': 're',
    '[object String]': 'st',
    '[object Symbol]': 'sy',
    '[object Undefined]': 'un',
    // TODO
};

const getPointerKey = (v) => {
    if (typeof v === 'number') {
        if (v === Infinity) {
            return '+I';
        }

        if (v === -Infinity) {
            return '-I';
        }

        if (v !== v) {
            return 'Na';
        }

        if (v === -0 && (1 / v) === -Infinity) {
            return '-0';
        }
    }
    else if (typeof v === 'boolean') {
        return v === true ? 'Bt' : 'Bf';
    }

    const systemName = Object.prototype.toString.call(v);
    const pointerKey = typeNameMap[systemName];

    if (!pointerKey) {
        throw `Could not find PointerKey for unrecognized type. Value: ${v}, Name: ${systemName}`;
    }

    return pointerKey;
}

const extractPointerKey = (pointer) => {
    return pointer.substr(0, 2);
};

const extractPointerIndex = (pointer) => {
    const part = pointer.substr(2);
    return part === '' ? -1 : parseInt(part, 10);
};

module.exports = {
    isSimplePointerKey: isSimplePointerKey,
    isValuePointerKey: isValuePointerKey,
    isContainerPointerKey: isContainerPointerKey,

    getPointerKey: getPointerKey,

    extractPointerKey: extractPointerKey,
    extractPointerIndex: extractPointerIndex,
};
