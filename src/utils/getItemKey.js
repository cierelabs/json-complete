import getSystemName from '/utils/getSystemName.js';

export default (store, item) => {
    // Simple Types
    for (let t = 0; t < store._simpleTypes.length; t += 1) {
        if (store._simpleTypes[t][0](item)) {
            return store._simpleTypes[t][1];
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
