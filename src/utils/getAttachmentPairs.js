const getPointerKey = require('./getPointerKey.js');

const concat = Array.prototype.concat;
const forEach = Array.prototype.forEach;
const push = Array.prototype.push;
const objKeys = Object.keys;
const objSymbols = Object.getOwnPropertySymbols;

module.exports = (v) => {
    // Find all indices
    // Objects not based on Arrays, like Objects and Sets, will not find any indices because we are using the Array.prototype.forEach
    const foundIndices = [];
    const indexObj = {};
    forEach.call(v, (value, index) => {
        indexObj[String(index)] = true;
        push.call(foundIndices, index);
    });

    // Find all keys (Strings and Symbols) that are not indices
    // For Arrays, TypedArrays, and Object-Wrapped Strings, the keys list will include indices as strings, so account for that by checking the indexObj
    const nonIndexKeys = [];
    const keys = concat.call(objKeys(v), objSymbols(v));
    forEach.call(keys, (key) => {
        if (!indexObj[key]) {
            push.call(nonIndexKeys, key);
        }
    });

    // Create the pairs from the set of acceptable keys
    // Object-Wrapped Strings would incorrectly parse the string as an indexed list, so ignore those indices
    const pairs = [];
    const pairKeys = getPointerKey(v) === 'ST' ? nonIndexKeys : concat.call(foundIndices, nonIndexKeys);
    let i = 0;
    forEach.call(pairKeys, (key) => {
        // For Arrays and Array-like objects, if the key is a number and matches the counting index, we don't have to encode the key value
        if (key === i) {
            push.call(pairs, [
                v[key],
            ]);
            i += 1;
            return;
        }

        push.call(pairs, [
            key,
            v[key],
        ]);
    });

    return pairs;
};
