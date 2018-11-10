import genArrayLike from '/utils/genArrayLike.js';

export default genArrayLike('Arguments', (store, key, index) => {
    return (function() {
        return arguments;
    }).apply(null, Array.from({
        length: store._encoded[key][index][0].length,
    }, () => {}));
});
