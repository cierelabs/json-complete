import alphabet from '/utils/baseConversion/alphabet.js';
import fromBase from '/utils/baseConversion/fromBase.js';
import numberEncoding from '/utils/compression/numberEncoding.js';
import splitPointers from '/utils/splitPointers.js';

export default (key, value, types) => {
    // Unrecognized Types, Strings, and Symbols get no additional decompression
    if (!types[key] || types[key]._compressionType === 0) {
        return value;
    }

    // Numbers and BigInts must be decoded by first uncompressing them, then splitting them by comma
    if (types[key]._compressionType === 1) {
        let decoded = [];

        // Decode two characters per loop
        const valueLength = value.length;
        for (let i = 0; i < valueLength - 1; i += 2) {
            decoded = decoded.concat([
                numberEncoding[(fromBase(value[i], alphabet) & 60) >>> 2],
                numberEncoding[((fromBase(value[i], alphabet) & 3) << 2) | ((fromBase(value[i + 1], alphabet) & 48) >> 4)],
                numberEncoding[fromBase(value[i + 1], alphabet) & 15],
            ]);
        }

        // Account for uneven numbers of characters
        if (valueLength % 2 !== 0) {
            decoded = decoded.concat([
                numberEncoding[fromBase(value[valueLength - 1], alphabet) >>> 2],
            ]);
        }

        // Last item is not a real value, remove
        if (decoded.length && decoded[decoded.length - 1] === ' ') {
            decoded = decoded.slice(0, -1);
        }

        return decoded.join('').split(',');
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
