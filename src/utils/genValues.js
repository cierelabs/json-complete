module.exports = (type, value) => {
    const pairs = [];
    type.prototype.forEach.call(value, (part) => {
        Array.prototype.push.call(pairs, [
            0,
            part,
        ]);
    });
    return pairs;
};
