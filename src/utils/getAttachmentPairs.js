const getPointerKey = require('./getPointerKey.js');

module.exports = (v) => {
    // Find all indices
    // Objects not based on Arrays, like Objects and Sets, will not find any indices here because we are using the Array.prototype.forEach
    const indices = [];
    const indexObj = {};
    Array.prototype.forEach.call(v, (value, index) => {
        indexObj[String(index)] = 1;
        indices.push(index);
    });

    // Find all String keys that are not indices
    // For Arrays, TypedArrays, and Object-Wrapped Strings, the keys list will include indices as strings, so account for that by checking the indexObj
    const strings = Object.keys(v).reduce((accumulator, key) => {
        if (!indexObj[key]) {
            accumulator.push(key);
        }
        return accumulator;
    }, []);

    const symbols = Object.getOwnPropertySymbols(v).reduce((accumulator, symbol) => {
        const symbolStringMatches = String(symbol).match(/^Symbol\(Symbol\.([^\)]*)\)$/);

        if (symbolStringMatches === null || symbolStringMatches.length !== 2 || Symbol[symbolStringMatches[1]] !== symbol) {
            accumulator.push(symbol);
        }

        return accumulator;
    }, []);

    // Object-Wrapped Strings would incorrectly parse the string as an indexed list, so ignore those indices
    let keys = strings.concat(symbols);
    keys = getPointerKey(v) === 'ST' ? keys : indices.concat(keys);

    let i = 0;
    return keys.map((key) => {
        // For Arrays and Array-like objects, if the key is a number and matches the counting index, we don't have to encode the key value
        if (key === i) {
            i += 1;
            return [
                v[key],
            ];
        }

        return [
            key,
            v[key],
        ];
    });
};
