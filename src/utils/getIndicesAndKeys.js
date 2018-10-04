const getAllKeys = require('./getAllKeys.js');

module.exports = (v) => {
    const indexObj = {};
    const indices = [];
    const keys = [];

    Array.prototype.forEach.call(v, (v, i) => {
        indexObj[String(i)] = true;
        indices.push(i);
    });

    Array.prototype.forEach.call(getAllKeys(v), (key) => {
        if (!indexObj[key]) {
            keys.push(key);
        }
    });

    return indices.concat(keys);
};
