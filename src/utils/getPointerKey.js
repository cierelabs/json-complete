const typeNameMap = {
    '[object Undefined]': 'un',
    '[object Null]': 'nl',
    '[object Boolean]': 'bo',
    '[object Number]': 'nm',
    '[object String]': 'st',
    '[object Date]': 'da',
    '[object RegExp]': 're',
    '[object Function]': 'fu',
    '[object Array]': 'ar',
    '[object Object]': 'ob',
    '[object Symbol]': 'sy',
    '[object Int8Array]': 'I1',
    '[object Uint8Array]': 'U1',
    '[object Uint8ClampedArray]': 'C1',
    '[object Uint16Array]': 'U2',
    '[object Int16Array]': 'I2',
    '[object Int32Array]': 'I3',
    '[object Uint32Array]': 'U3',
    '[object Float32Array]': 'F3',
    '[object Float64Array]': 'F4',
    '[object Set]': 'Se',
    '[object Map]': 'Ma',
    // TODO
};

const objectWrapperTypeNameMap = {
    '[object Boolean]': 'BO',
    '[object Number]': 'NM',
    '[object String]': 'ST',
};

module.exports = (v) => {
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
};
