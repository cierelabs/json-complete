import types from '/src/types.mjs';

const log = (a) => {
    try {
        console.log(a);
    }
    catch (e) {
        // Do nothing
    }
};

const objectWrapperTypeNameMap = {
    'Boolean': 'BO',
    'Number': 'NM',
    'String': 'ST',
};

// NOTE: Because Sets and Maps can accept any value as an entry (or key for Map), if unrecognized or unsupported types did not retain referencial integrity, data loss could occur.
// For example, if they were replaced with null, any existing entry keyed with null in a Map would be overwritten. Likewise, the Set could have its order changed.

export default (v) => {
    if (v === void 0) {
        // Specific support added, because these types didn't have a proper systemName prior to around 2010 Javascript
        return 'un';
    }
    else if (v === null) {
        // Specific support added, because these types didn't have a proper systemName prior to around 2010 Javascript
        return 'nl';
    }
    else if (v === true) {
        return 'bt';
    }
    else if (v === false) {
        return 'bf';
    }
    else if (typeof v === 'number') {
        if (v === Infinity) {
            return 'pI';
        }

        if (v === -Infinity) {
            return 'nI';
        }

        if (v !== v) {
            return 'na';
        }

        if (v === -0 && (1 / v) === -Infinity) {
            return 'n0';
        }
    }

    const systemName = Object.prototype.toString.call(v).replace(/\[object |\]/g, '');

    if (typeof v === 'object') {
        // Primitive types can sometimes be wrapped as Objects and must be handled differently
        const wrappedPointerKey = objectWrapperTypeNameMap[systemName];
        if (wrappedPointerKey) {
            return wrappedPointerKey;
        }
    }

    const pointerKey = Object.keys(types).find((typeKey) => {
        if (systemName === types[typeKey].systemName) {
            return typeKey;
        }
    });

    if (!pointerKey) {
        log(`Unsupported type "${systemName}". Value reference replaced with empty object:`);
        log(v);
        return 'ob';
    }

    return pointerKey;
};
