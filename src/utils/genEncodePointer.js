const getPointerKey = require('./getPointerKey.js');

module.exports = (data, value) => {
    const pointerKey = getPointerKey(value);
    data[pointerKey] = data[pointerKey] || [];
    const pointerIndex = data[pointerKey].length;

    return {
        k: pointerKey,
        i: pointerIndex,
        v: value,
        p: `${pointerKey}${pointerIndex}`,
    };
};
