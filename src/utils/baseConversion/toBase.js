export default (number, alphabet) => {
    let result = '';
    const radix = alphabet.length;

    do {
        result = alphabet[number % radix] + result;
        number = Math.floor(number / radix);
    } while (number);

    return result;
};
