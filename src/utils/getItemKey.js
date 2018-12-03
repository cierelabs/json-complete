import getSystemName from '/utils/getSystemName.js';

export default (store, item) => {
    if (item === void 0) {
        return 'un';
    }

    if (item === null) {
        return 'nl';
    }

    if (item === true) {
        return 'tr';
    }

    if (item === false) {
        return 'fa';
    }

    if (typeof item === 'number') {
        if (item === Infinity) {
            return 'pI';
        }

        if (item === -Infinity) {
            return 'nI';
        }

        if (item !== item) {
            return 'Na';
        }

        if (item === 0 && (1 / item) === -Infinity) {
            return 'n0';
        }
    }

    let systemName = getSystemName(item);
    const wrappedTypeSystemName = store._wrappedTypeMap[systemName];

    if (wrappedTypeSystemName && typeof item === 'object') {
        systemName = wrappedTypeSystemName;
    }

    return store._typeMap[systemName];
};
