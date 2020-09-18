const systemName = (v) => {
    return Object.prototype.toString.call(v);
};

const isNanValue = (v) => {
    return systemName(v) === '[object Number]' && v !== v;
};

const isNegativeZero = (v) => {
    return v === 0 && (1 / v) === -Infinity;
};

const isSymbol = (v) => {
    return systemName(v) === '[object Symbol]';
};

const isFunction = (v) => {
    return systemName(v) === '[object Function]';
};

const isObject = (v) => {
    return systemName(v) === '[object Object]';
};

const isArray = (v) => {
    return systemName(v) === '[object Array]';
};

const simplifyEncoded = (encoded) => {
    const parsed = JSON.parse(encoded);
    const objectForm = parsed.slice(1).reduce((accumulator, e) => {
        accumulator[e[0]] = e[1];
        return accumulator;
    }, {});
    objectForm.r = parsed[0].split(',')[0];
    return objectForm;
};

const getGlobal = () => {
    const isInBrowserThread = () => {
        // Global window object, or window object with document key does not exist
        if (typeof window === 'undefined' || !window || !window.document) {
            return false;
        }

        try {
            // The value at the window document's key can be modified, and therefore isn't the really the global window
            // Restore the old value and return
            const oldDocument = window.document;
            window.document = false;
            if (!window.document) {
                window.document = oldDocument;
                return false;
            }
        } catch (e) {
            // Do nothing
        }

        // Had to pull this out into variable to prevent uglify from too aggressively mangling the logic incorrectly
        const typeOfDocumentAll = typeof document.all;

        try {
            // https://github.com/denysdovhan/wtfjs#documentall-is-an-object-but-it-is-undefined
            // document.all is an Object instance
            // document.all is not equal to undefined
            // Yet typeof document.all is undefined
            // This is defined by the HTML spec, and as far as I know, cannot be emulated
            return document.all instanceof Object && document.all !== void 0 && typeOfDocumentAll === 'undefined';
        }
        catch (e) {
            return false;
        }
    };

    const isInWorker = () => {
        // Global self object, or self object with self key does not exist
        if (typeof self === 'undefined' || !self || !self.self) {
            return false;
        }

        // The value at the self's self key can be modified, and therefore isn't the really the global self
        // Restore the old value and return
        const oldSelf = self.self;
        self.self = false;
        if (!self.self) {
            self.self = oldSelf;
            return false;
        }

        return true;
    };

    if (isInBrowserThread()) {
        return window;
    }

    if (isInWorker()) {
        return self;
    }

    return global;
};

const getOnlyKeyFromCollection = (collection) => {
    let key;
    collection.forEach((v, k) => {
        key = k;
    });
    return key;
};

const getOnlyValueFromCollection = (collection) => {
    let value;
    collection.forEach((v) => {
        value = v;
    });
    return value;
};

const setSupportsDistinctNegativeZero = () => {
    const test = new Set();
    test.add(-0);
    return isNegativeZero(getOnlyValueFromCollection(test));
};

const mapSupportsDistinctNegativeZeroKeys = () => {
    const test = new Map();
    test.set(-0, 1);
    return isNegativeZero(getOnlyKeyFromCollection(test));
};

const regexSupportsSticky = () => {
    try {
        const value = new RegExp('a', 'y');
        return typeof value.source === 'string';
    } catch(e) {
        return false;
    }
};

const regexSupportsUnicode = () => {
    try {
        const value = new RegExp('a', 'u');
        return typeof value.source === 'string';
    } catch(e) {
        return false;
    }
};

const getAllKeys = (obj) => {
    let keys = Object.keys(obj);
    if (typeof Symbol === 'function') {
        keys = keys.concat(Object.getOwnPropertySymbols(obj));
    }
    return keys;
};

export default {
    systemName: systemName,
    isNanValue: isNanValue,
    isNegativeZero: isNegativeZero,
    isSymbol: isSymbol,
    isFunction: isFunction,
    isObject: isObject,
    isArray: isArray,
    simplifyEncoded: simplifyEncoded,
    getGlobal: getGlobal,
    getOnlyKeyFromCollection: getOnlyKeyFromCollection,
    getOnlyValueFromCollection: getOnlyValueFromCollection,
    setSupportsDistinctNegativeZero: setSupportsDistinctNegativeZero,
    mapSupportsDistinctNegativeZeroKeys: mapSupportsDistinctNegativeZeroKeys,
    regexSupportsSticky: regexSupportsSticky,
    regexSupportsUnicode: regexSupportsUnicode,
    getAllKeys: getAllKeys,
};
