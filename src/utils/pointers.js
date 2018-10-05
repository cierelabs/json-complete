const simpleKeys = {
    'un': 1, // undefined
    'nl': 1, // null
    'bt': 1, // true
    'bf': 1, // false
    'na': 1, // NaN
    '-i': 1, // -Infinity
    '+i': 1, // Infinity
    'n0': 1, // -0
};

const isSimplePointerKey = (pointerKey) => {
    return Boolean(simpleKeys[pointerKey]);
};

const valueKeys = {
    'nm': 1, // number
    'st': 1, // string
    'sy': 1, // symbol
    'Fi': 1, // File
    'Bl': 1, // Blob
};

const isValuePointerKey = (pointerKey) => {
    return Boolean(valueKeys[pointerKey]);
};

const containerKeys = {
    'da': 1, // date
    're': 1, // regex
    'fu': 1, // function
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
    '[object Boolean]': 'bo',
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
    const systemName = Object.prototype.toString.call(v);
    const pointerKey = typeNameMap[systemName];

    if (typeof v === 'number') {
        if (v === Infinity) {
            return '+i';
        }

        if (v === -Infinity) {
            return '-i';
        }

        if (v !== v) {
            return 'na';
        }

        if (v === -0 && (1 / v) === -Infinity) {
            return 'n0';
        }
    }
    else if (typeof v === 'boolean') {
        return v === true ? 'bt' : 'bf';
    }
    else if (typeof v === 'object') {
        if (pointerKey === 'bo') {

        }
    }



    if (!pointerKey) {
        throw `Could not find PointerKey for unrecognized type. Value: ${v}, Name: ${systemName}`;
    }

    return pointerKey;
}

module.exports = {
    isSimplePointerKey: isSimplePointerKey,
    isValuePointerKey: isValuePointerKey,
    isContainerPointerKey: isContainerPointerKey,

    getPointerKey: getPointerKey,
};
