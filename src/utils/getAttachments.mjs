export default (v) => {
    const attached = {
        indices: [],
        attachments: [],
    };

    // Find all indices
    const indices = [];
    const indexObj = {};
    // Objects not based on Arrays, like Objects and Sets, will not find any indices here because we are using the Array.prototype.forEach
    Array.prototype.forEach.call(v, (value, index) => {
        indexObj[String(index)] = 1;
        indices.push(index);
    });

    // Have to use external index iterator because we want the counting to stop once the first index incongruity occurs
    let i = 0;

    // Find all String keys that are not indices
    // For Arrays, TypedArrays, and Object-Wrapped Strings, the keys list will include indices as strings, so account for that by checking the indexObj
    let keys = Object.keys(v).filter((key) => {
        return !indexObj[key];
    }).concat(Object.getOwnPropertySymbols(v).filter((symbol) => {
        // Ignore built-in Symbols
        const symbolStringMatches = String(symbol).match(/^Symbol\(Symbol\.([^\)]*)\)$/);
        return symbolStringMatches === null || symbolStringMatches.length !== 2 || Symbol[symbolStringMatches[1]] !== symbol;
    }));

    // Create the lists
    return indices.concat(keys).reduce((accumulator, key) => {
        if (key === i) {
            i += 1;
            accumulator.indices.push(v[key]);
        }
        else {
            accumulator.attachments.push([key, v[key]]);
        }
        return accumulator;
    }, attached);
};
