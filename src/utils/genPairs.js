module.exports = (container, keys) => {
    const pairs = [];
    Array.prototype.forEach.call(keys, (key) => {
        Array.prototype.push.call(pairs, [
            key,
            container[key],
        ]);
    });
    return pairs;
};
