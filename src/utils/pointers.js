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
    'nm': 1, // Number
    'st': 1, // String
    'sy': 1, // Symbol
    'Fi': 1, // File
    'Bl': 1, // Blob
};

const isValuePointerKey = (pointerKey) => {
    return Boolean(valueKeys[pointerKey]);
};

const containerKeys = {
    'da': 1, // Date
    're': 1, // Regex
    'fu': 1, // Function
    'ob': 1, // Object
    'ar': 1, // Array
    'BO': 1, // Object-wrapped Boolean
    'NM': 1, // Object-wrapped Number
    'ST': 1, // Object-wrapped String
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
    '[object Float32Array]': 'F3',
    '[object Float64Array]': 'F4',
    '[object Function]': 'fu',
    '[object Int16Array]': 'I2',
    '[object Int32Array]': 'I3',
    '[object Int8Array]': 'I1',
    '[object Null]': 'nl',
    '[object Number]': 'nm',
    '[object Object]': 'ob',
    '[object RegExp]': 're',
    '[object String]': 'st',
    '[object Symbol]': 'sy',
    '[object Uint16Array]': 'U2',
    '[object Uint32Array]': 'U3',
    '[object Uint8Array]': 'U1',
    '[object Uint8ClampedArray]': 'C1',
    '[object Undefined]': 'un',
    // TODO
};

const objectWrapperTypeNameMap = {
    '[object Boolean]': 'BO',
    '[object Number]': 'NM',
    '[object String]': 'ST',
};

const getPointerKey = (v) => {
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

    const systemName = Object.prototype.toString.call(v);

    if (typeof v === 'object') {
        // Primitive types can sometimes be wrapped as Objects and must be handled differently
        const wrappedPointerKey = objectWrapperTypeNameMap[systemName];
        if (wrappedPointerKey) {
            return wrappedPointerKey;
        }
    }

    const pointerKey = typeNameMap[systemName];

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
