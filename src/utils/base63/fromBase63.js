import alphabet from '/utils/base63/alphabet.js';

const radix = alphabet.length;

export default (base63) => {
    return base63.split('').reduce((character, index) => {
        return character * radix + alphabet.indexOf(index);
    }, 0);
};
