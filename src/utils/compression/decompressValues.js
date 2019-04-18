import alphabet from '/utils/baseConversion/alphabet.js';
import fromBase from '/utils/baseConversion/fromBase.js';
import splitPointers from '/utils/splitPointers.js';


export default (key, value, types) => {
    // Unrecognized Types, Strings, and Symbols get no additional decompression
    if (!types[key] || types[key]._compressionType === 0) {
        return value;
    }

    // Join Numbers and BigInts using comma, strings need to stay in Array form
    if (types[key]._compressionType === 1) {
        return value.split(',');
    }

    // Split items into Pointer data sets, and split Pointer data sets into individual Pointers
    // Convert each pointer from Base string indices, and account for simple types having no index
    return value.split(',').map((valueItems) => {
        return valueItems.split(' ').map((pointerCombinedString) => {
            const parts = splitPointers(pointerCombinedString).slice(1);

            const pointers = [];
            for (let p = 0; p < parts.length; p += 2) {
                pointers.push(parts[p] + fromBase(parts[p + 1], alphabet));
            }
            return pointers;
        });
    });
};
