import extractPointer from '/utils/extractPointer.js';

// This is the function for getting pointer values in the generateReference functions
export default (store, pointer) => {
    if (store._types[pointer]) {
        return store._types[pointer]._value;
    }

    const p = extractPointer(pointer);

    return store._types[p._key]._generateReference(store, p._key, p._index);
};
