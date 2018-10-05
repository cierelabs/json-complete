const pointers = require('./pointers.js');

module.exports = (pointer) => {
    return {
        k: pointers.extractPointerKey(pointer),
        i: pointers.extractPointerIndex(pointer),
        p: pointer,
    };
};
