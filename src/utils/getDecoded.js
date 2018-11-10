import extractPointer from '/utils/extractPointer.js';
import isSimple from '/utils/isSimple.js';

// This is the function for getting pointer references in the build functions
export default (store, pointer) => {
    if (isSimple(store._types, pointer)) {
        return store._types[pointer]._build();
    }

    const p = extractPointer(pointer);

    if (!store._types[p._key]) {
        return pointer;
    }

    return store._decoded[pointer]._value;
};
