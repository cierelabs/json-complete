module.exports = (v) => {
    let keys = Object.keys(v);

    if (Object.getOwnPropertySymbols) {
        keys = keys.concat(Object.getOwnPropertySymbols(v));
    }

    return keys;
};
