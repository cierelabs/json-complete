module.exports = (container, keys) => {
    const pairs = [];
    Array.prototype.forEach.call(keys, (key) => {
        pairs.push([
            key,
            container[key],
        ]);
    });
    return pairs;
};
