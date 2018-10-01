

const simpleKeys = {
    'un': true, // undefined
    'nl': true, // null
    'Bt': true, // true
    'Bf': true, // false
    'Na': true, // NaN
    '-I': true, // -Infinity
    '+I': true, // Infinity
    '-0': true, // -0
};

export const isSimplePointerKey = (pointerKey) => {
    return simpleKeys[pointerKey];
};

const valueKeys = {
    'nm': true, // number
    'st': true, // string
    're': true, // regex
    'da': true, // date
    'sy': true, // symbol
    'fu': true, // function
    'Fi': true, // File
    'Bl': true, // Blob
};

export const isValuePointerKey = (pointerKey) => {
    return valueKeys[pointerKey];
};

const containerKeys = {
    'ob': true, // object
    'ar': true, // array
    'I1': true, // Int8Array
    'U1': true, // Uint8Array
    'C1': true, // Uint8ClampedArray
    'I2': true, // Int16Array
    'U2': true, // Uint16Array
    'I3': true, // Int32Array
    'U3': true, // Uint32Array
    'F3': true, // Float32Array
    'F4': true, // Float64Array
    'AB': true, // ArrayBuffer
    'Ma': true, // Map
    'Se': true, // Set
    'WM': true, // WeakMap
    'WS': true, // WeakSet
};

export const isContainerPointerKey = (pointerKey) => {
    return containerKeys[pointerKey];
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

export const getPointerKey = (v) => {
    if (v === true) {
        return 'Bt';
    }

    if (v === false) {
        return 'Bf';
    }

    if (v === Infinity) {
        return '+I';
    }

    if (v === -Infinity) {
        return '-I';
    }

    const systemName = Object.prototype.toString.call(v);
    const pointerKey = typeNameMap[systemName];

    if (!pointerKey) {
        throw `Unrecognized value type. Could not find PointerKey for it. Value: ${v}, Name: ${systemName}`;
    }

    if (pointerKey === 'nm') {
        if (v !== v) {
            return 'Na';
        }

        if (v === -0 && (1 / v) === -Infinity) {
            return '-0';
        }
    }

    return pointerKey;
}

export const extractPointerKey = (pointer) => {
    return pointer.substr(0, 2);
};

export const extractPointerIndex = (pointer) => {
    const part = pointer.substr(2);
    return part === '' ? -1 : parseInt(part, 10);
};

export const genIndexedPointer = (pointerKey, index) => {
    return `${pointerKey}${index}`;
};

export default {
    isSimplePointerKey: isSimplePointerKey,
    isValuePointerKey: isValuePointerKey,
    isContainerPointerKey: isContainerPointerKey,

    getPointerKey: getPointerKey,

    extractPointerKey: extractPointerKey,
    extractPointerIndex: extractPointerIndex,

    genIndexedPointer: genIndexedPointer,
};
