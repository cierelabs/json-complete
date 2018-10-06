module.exports = (v) => {
    let keys = Object.keys(v);

    if (Object.getOwnPropertySymbols) {
        keys = Array.prototype.concat.call(keys, Object.getOwnPropertySymbols(v));
    }

    return keys;
};
