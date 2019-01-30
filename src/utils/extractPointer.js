import splitPointers from '/utils/splitPointers.js';

export default (pointer) => {
    const parts = splitPointers(pointer);
    return {
        _key: parts[1],
        _index: Number(parts[2]),
    };
};
