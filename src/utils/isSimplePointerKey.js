const simpleKeys = {
    'un': 1, // undefined
    'nl': 1, // null
    'bt': 1, // true
    'bf': 1, // false
    'na': 1, // NaN
    '-i': 1, // -Infinity
    '+i': 1, // Infinity
    'n0': 1, // -0
};

module.exports = (pointerKey) => {
    return Boolean(simpleKeys[pointerKey]);
};
