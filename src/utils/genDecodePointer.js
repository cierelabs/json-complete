const extractPointerIndex = require('./extractPointerIndex.js');

module.exports = (pointer) => {
    return {
        k: pointer.substr(0, 2),
        i: extractPointerIndex(pointer),
        p: pointer,
    };
};
