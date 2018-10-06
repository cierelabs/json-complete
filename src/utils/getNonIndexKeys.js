const getAllKeys = require('./getAllKeys.js');

module.exports = (v) => {
    const indexObj = {};
    const keys = [];

    Array.prototype.forEach.call(v, (v, i) => {
        indexObj[String(i)] = true;
    });

    Array.prototype.forEach.call(getAllKeys(v), (key) => {
        if (!indexObj[key]) {
            Array.prototype.push.call(keys, key);
        }
    });

    return keys;
};
