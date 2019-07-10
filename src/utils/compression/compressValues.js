import alphabet from '/utils/baseConversion/alphabet.js';
import extractPointer from '/utils/extractPointer.js';
import numberEncoding from '/utils/compression/numberEncoding.js';
import toBase from '/utils/baseConversion/toBase.js';

export default (key, value, types) => {
    // Unrecognized Types, Strings, and Symbols get no additional compression
    if (!types[key] || types[key]._compressionType === 0) {
        return value;
    }

    // Join Numbers and BigInts using comma, then compress the string taking into account that Numbers and BigInts can only use up to 14 characters as strings (0-9, ., -, +, e) plus the comma separator
    if (types[key]._compressionType === 1) {
        // Join the numbers with commas (also converting all values to string form), lowercase the exponential part (if applicable), then break up into individual characters
        const characters = value.join(',').replace(/E/g, 'e').split('');

        let previous = 0;
        const encoded = [];
        for (let c = 0; c < characters.length; c += 1) {
            const index = numberEncoding.indexOf(characters[c]);

            if (c % 3 === 0) {
                previous = index << 2;
            }
            else if (c % 3 === 1) {
                previous |= index >>> 2;
                encoded.push(toBase(previous, alphabet));
                previous = (index & 3) << 4;
            }
            else {
                previous |= index;
                encoded.push(toBase(previous, alphabet));
            }
        }

        // Add remaining bit data
        if (characters.length % 3 !== 0) {
            encoded.push(toBase(previous, alphabet));
        }

        return encoded.join('');
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
