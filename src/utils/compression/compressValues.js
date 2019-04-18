import alphabet from '/utils/baseConversion/alphabet.js';
import extractPointer from '/utils/extractPointer.js';
import toBase from '/utils/baseConversion/toBase.js';

export default (key, value, types) => {
    // Unrecognized Types, Strings, and Symbols get no additional compression
    if (!types[key] || types[key]._compressionType === 0) {
        return value;
    }

    // Join Numbers and BigInts using comma, strings need to stay in Array form
    if (types[key]._compressionType === 1) {
        return value.join(',');
    }

    // Convert all indices to Base string notation, separate item parts with comma, and separate items with space
    return value.map((outerArray) => {
        return outerArray.map((innerArray) => {
            return innerArray.map((pointer) => {
                const parts = extractPointer(pointer);
                return parts._key + toBase(parts._index, alphabet);
            }).join('');
        }).join(' ');
    }).join(',');
};
