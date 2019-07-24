export default (item, encodeSymbolKeys) => {
    // Find all indices
    const indices = [];
    const indexObj = {};
    // Objects not based on Arrays, like Objects and Sets, will not find any indices here because we are using the Array.prototype.forEach
    Array.prototype.forEach.call(item, (value, index) => {
        indexObj[String(index)] = 1;
        indices.push(index);
    });

    // Find all String keys that are not indices
    // For Arrays, TypedArrays, and Object-Wrapped Strings, the keys list will include indices as strings, so account for that by checking the indexObj
    let keys = Object.keys(item).filter((key) => {
        return !indexObj[key];
    });

    if (encodeSymbolKeys && typeof Symbol === 'function') {
        keys = keys.concat(Object.getOwnPropertySymbols(item).filter((symbol) => {
            // Ignore built-in Symbols
            // If the Symbol ID that is part of the Symbol global is not equal to the tested Symbol, then it is NOT a built-in Symbol
            return Symbol[String(symbol).slice(14, -1)] !== symbol;
        }));
    }

    // Have to use external index iterator because we want the counting to stop once the first index incongruity occurs
    let i = 0;

    // Create the lists
    return indices.concat(keys).reduce((accumulator, key) => {
        if (key === i) {
            i += 1;
            accumulator._indices.push(item[key]);
        }
        else {
            accumulator._keys.push(key);
            accumulator._values.push(item[key]);
        }
        return accumulator;
    }, {
        _indices: [],
        _keys: [],
        _values: [],
    });
};
