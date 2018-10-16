const getPointerKey = require('./getPointerKey.js');

module.exports = (v) => {
    // Find all indices
    // Objects not based on Arrays, like Objects and Sets, will not find any indices here because we are using the Array.prototype.forEach
    const foundIndices = [];
    const indexObj = {};
    Array.prototype.forEach.call(v, (value, index) => {
        indexObj[String(index)] = true;
        foundIndices.push(index);
    });

    // Find all keys (Strings and Symbols) that are not indices
    // For Arrays, TypedArrays, and Object-Wrapped Strings, the keys list will include indices as strings, so account for that by checking the indexObj
    const nonIndexKeys = [];
    const keys = Object.keys(v).concat(Object.getOwnPropertySymbols(v));
    keys.forEach((key) => {
        if (!indexObj[key]) {
            nonIndexKeys.push(key);
        }
    });

    // Create the pairs from the set of acceptable keys
    // Object-Wrapped Strings would incorrectly parse the string as an indexed list, so ignore those indices
    const pairs = [];
    const pairKeys = getPointerKey(v) === 'ST' ? nonIndexKeys : foundIndices.concat(nonIndexKeys);
    let i = 0;
    pairKeys.forEach((key) => {
        // For Arrays and Array-like objects, if the key is a number and matches the counting index, we don't have to encode the key value
        if (key === i) {
            pairs.push([
                v[key],
            ]);
            i += 1;
            return;
        }

        pairs.push([
            key,
            v[key],
        ]);
    });

    return pairs;
};
