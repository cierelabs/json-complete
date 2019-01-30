import fromBase63 from '/utils/base63/fromBase63.js';
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
    // Convert each pointer from Base63 indies, and account for simple types having no index
    return value.split(',').map((valueItems) => {
        return valueItems.split(' ').map((pointerCombinedString) => {
            const parts = splitPointers(pointerCombinedString).slice(1);

            const pointers = [];
            for (let p = 0; p < parts.length; p += 2) {
                const key = parts[p];
                const isSimple = types[key] && !types[key]._systemName;

                pointers.push(isSimple ? key : key + fromBase63(parts[p + 1]));
            }
            return pointers;
        });
    });
};
