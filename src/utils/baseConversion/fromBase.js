export default (numberString, alphabet) => {
    const radix = alphabet.length;

    return numberString.split('').reduce((character, index) => {
        return character * radix + alphabet.indexOf(index);
    }, 0);
};
