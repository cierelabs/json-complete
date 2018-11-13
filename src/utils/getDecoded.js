import extractPointer from '/utils/extractPointer.js';

// This is the function for getting pointer references in the build functions
export default (store, pointer) => {
    if (store._types[pointer]) {
        return store._types[pointer]._value;
    }

    const p = extractPointer(pointer);
    if (store._types[p._key]) {
        return store._decoded[pointer]._reference;
    }

    if (store._safe) {
        return pointer;
    }

    throw new Error(`Cannot decode unrecognized pointer type "${p._key}".`);
};
