import extractPointer from '/utils/extractPointer.js';
import toBase63 from '/utils/base63/toBase63.js';

export default (key, value, types) => {
    // Unrecognized Types, Strings, and Symbols get no additional compression
    if (!types[key] || types[key]._compressionType === 0) {
        return value;
    }

    // Join Numbers and BigInts using comma, strings need to stay in Array form
    if (types[key]._compressionType === 1) {
        return value.join(',');
    }

    // Convert all indices to Base63 notation, separate item parts with comma, and separate items with space
    return value.map((outerArray) => {
        return outerArray.map((innerArray) => {
            return innerArray.map((pointer) => {
                const parts = extractPointer(pointer);
                return parts._key + toBase63(parts._index);
            }).join('');
        }).join(' ');
    }).join(',');
};
