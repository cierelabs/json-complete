import alphabet from '/utils/base63/alphabet.js';

const radix = alphabet.length;

export default (number) => {
    let result = '';

    do {
        result = alphabet[number % radix] + result;
        number = Math.floor(number / radix);
    } while (number);

    return result;
};
