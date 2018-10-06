module.exports = (pointer) => {
    const part = String.prototype.substr.call(pointer, 2);
    return part === '' ? -1 : parseInt(part, 10);
};
