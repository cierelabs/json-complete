export default (pointer) => {
    return {
        _key: pointer.slice(0, 2),
        _index: parseInt(pointer.slice(2), 10),
    };
};
