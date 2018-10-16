const log = require('./log.js');

const typeNameMap = {
    '[object Number]': 'nm',
    '[object String]': 'st',
    '[object Date]': 'da',
    '[object RegExp]': 're',
    '[object Function]': 'fu',
    '[object Error]': 'er',
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
    '[object Blob]': 'Bl',
    '[object File]': 'Fi',
};

const objectWrapperTypeNameMap = {
    '[object Boolean]': 'BO',
    '[object Number]': 'NM',
    '[object String]': 'ST',
};

// NOTE: Because Sets and Maps can accept any value as an entry (or key for Map), if unrecognized or unsupported types did not retain referencial integrity, data loss could occur.
// For example, if they were replaced with null, any existing entry keyed with null in a Map would be overwritten. Likewise, the Set could have its order changed.

module.exports = (v) => {
    if (v === void 0) {
        // Specific support added, because these types didn't have a proper systemName prior to around 2010 Javascript
        return 'un';
    }
    else if (v === null) {
        // Specific support added, because these types didn't have a proper systemName prior to around 2010 Javascript
        return 'nl';
    }
    else if (typeof v === 'number') {
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
    else if (v === true) {
        return 'bt';
    }
    else if (v === false) {
        return 'bf';
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
        log(`Unsupported type "${systemName}". Value reference replaced with empty object:`);
        log(v);
        return 'ob';
    }

    return pointerKey;
};
