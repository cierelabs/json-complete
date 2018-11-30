export default (pointer) => {
    return {
        _key: pointer.slice(0, 2),
        _index: Number(pointer.slice(2)),
    };
};
