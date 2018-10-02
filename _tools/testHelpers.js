const isNanValue = (v) => {
    return Object.prototype.toString.call(v) === '[object Number]' && v !== v;
};

const isNegativeZero = (v) => {
    return v === -0 && (1 / v) === -Infinity
};

const isRegex = (v) => {
    return Object.prototype.toString.call(v) === '[object RegExp]';
};

const isSymbol = (v) => {
    return Object.prototype.toString.call(v) === '[object Symbol]';
};

const isFunction = (v) => {
    return Object.prototype.toString.call(v) === '[object Function]';
};

const isObject = (v) => {
    return Object.prototype.toString.call(v) === '[object Object]';
};

const isArray = (v) => {
    return Object.prototype.toString.call(v) === '[object Array]';
};

module.exports = {
    isNanValue: isNanValue,
    isNegativeZero: isNegativeZero,
    isRegex: isRegex,
    isSymbol: isSymbol,
    isFunction: isFunction,
    isObject: isObject,
    isArray: isArray,
};
