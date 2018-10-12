const systemName = (v) => {
    return Object.prototype.toString.call(v);
};

const isNanValue = (v) => {
    return systemName(v) === '[object Number]' && v !== v;
};

const isNegativeZero = (v) => {
    return v === -0 && (1 / v) === -Infinity
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

/* istanbul ignore next */
const isInBrowser = () => {
    try {
        // https://github.com/denysdovhan/wtfjs#documentall-is-an-object-but-it-is-undefined
        return document !== void 0 && document.all instanceof Object && document.all !== void 0 && typeof document.all === 'undefined';
    }
    catch (e) {
        // Do nothing
    }

    return false;
};

module.exports = {
    systemName: systemName,
    isNanValue: isNanValue,
    isNegativeZero: isNegativeZero,
    isSymbol: isSymbol,
    isFunction: isFunction,
    isObject: isObject,
    isArray: isArray,
    isInBrowser: isInBrowser,
};
