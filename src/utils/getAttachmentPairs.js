const getPointerKey = require('./getPointerKey.js');

module.exports = (v) => {
    // Find all indices
    // Objects not based on Arrays, like Objects and Sets, will not find any indices because we are using the Array.prototype.forEach
    const foundIndices = [];
    const indexObj = {};
    Array.prototype.forEach.call(v, (value, index) => {
        indexObj[String(index)] = true;
        Array.prototype.push.call(foundIndices, index);
    });

    // Find all keys (Strings and Symbols) that are not indices
    // For Arrays, TypedArrays, and Object-Wrapped Strings, the keys list will include indices as strings, so account for that by checking the indexObj
    let keys = Object.keys(v);
    if (Object.getOwnPropertySymbols) {
        keys = Array.prototype.concat.call(keys, Object.getOwnPropertySymbols(v));
    }
    const foundKeys = [];
    Array.prototype.forEach.call(keys, (key) => {
        if (!indexObj[key]) {
            Array.prototype.push.call(foundKeys, key);
        }
    });

    // Object-Wrapped Strings would incorrectly parse the string as an indexed list, so ignore indices
    const pairKeys = getPointerKey(v) === 'ST' ? foundKeys : foundIndices.concat(foundKeys);

    // Create the pairs from the set of acceptable keys
    const pairs = [];
    Array.prototype.forEach.call(pairKeys, (key) => {
        Array.prototype.push.call(pairs, [
            key,
            v[key],
        ]);
    });

    return pairs;
};
