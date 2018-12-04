import extractPointer from '/utils/extractPointer.js';

// This is the function for getting pointer references in the build functions
export default (store, pointer) => {
    // Simple type, return the value
    if (store._types[pointer]) {
        return store._types[pointer]._value;
    }

    // Normal type, return the reference
    const p = extractPointer(pointer);
    if (store._types[p._key]) {
        return store._decoded[pointer]._reference;
    }

    // We will never reach this point without being in compat mode, return the pointer string
    return pointer;
};
