import getSystemName from '/utils/getSystemName.js';

const wrappedPrimitives = {
    Boolean: 'Bo', // Object-Wrapped Boolean
    Number: 'NU', // Object-Wrapped Number
    String: 'ST', // Object-Wrapped String
};

export default (types, item) => {
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

    const systemName = getSystemName(item);

    if (typeof item === 'object' && wrappedPrimitives[systemName]) {
        return wrappedPrimitives[systemName];
    }

    return Object.keys(types).find((typeKey) => {
        return systemName === types[typeKey]._systemName;
    });
};
