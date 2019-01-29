import getSystemName from '/utils/getSystemName.js';

export default (store, item) => {
    if (item === void 0) {
        return 'K';
    }

    if (item === null) {
        return 'L';
    }

    if (item === true) {
        return 'T';
    }

    if (item === false) {
        return 'F';
    }

    if (typeof item === 'number') {
        if (item === Infinity) {
            return 'I';
        }

        if (item === -Infinity) {
            return 'J';
        }

        // NaN
        if (item !== item) {
            return 'C';
        }

        // -0
        if (item === 0 && (1 / item) === -Infinity) {
            return 'M';
        }
    }

    // In IE11, Set and Map are supported, but they do not have the expected System Name
    if (typeof Set === 'function' && item instanceof Set) {
        return 'U';
    }

    if (typeof Map === 'function' && item instanceof Map) {
        return 'V';
    }

    let systemName = getSystemName(item);
    const wrappedTypeSystemName = store._wrappedTypeMap[systemName];

    if (wrappedTypeSystemName && typeof item === 'object') {
        systemName = wrappedTypeSystemName;
    }

    return store._typeMap[systemName];
};
