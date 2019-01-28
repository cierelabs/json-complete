export default (pointer) => {
    const parts = pointer.split(/([A-Z$_]+)/);
    return {
        _key: parts[1],
        _index: Number(parts[2]),
    };
};
