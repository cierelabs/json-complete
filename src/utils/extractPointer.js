export default (pointer) => {
    return {
        _key: pointer.substring(0, 2),
        _index: parseInt(pointer.substring(2), 10),
    };
};
