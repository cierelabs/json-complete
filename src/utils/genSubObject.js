const getAllKeys = require('./getAllKeys.js');

module.exports = (v) => {
    const obj = {};
    Array.prototype.forEach.call(getAllKeys(v), (key) => {
        obj[key] = v[key];
    });
    return obj;
};
