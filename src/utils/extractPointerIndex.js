module.exports = (pointer) => {
    const part = pointer.substr(2);
    return part === '' ? -1 : parseInt(part, 10);
};
