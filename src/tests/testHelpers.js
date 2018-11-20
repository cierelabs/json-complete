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
    return encoded.filter((i) => {
        return i[0] !== 'v';
    }).reduce((accumulator, e) => {
        accumulator[e[0]] = e[1];
        return accumulator;
    }, {});
};

module.exports = {
    systemName: systemName,
    isNanValue: isNanValue,
    isNegativeZero: isNegativeZero,
    isSymbol: isSymbol,
    isFunction: isFunction,
    isObject: isObject,
    isArray: isArray,
    simplifyEncoded: simplifyEncoded,
};
