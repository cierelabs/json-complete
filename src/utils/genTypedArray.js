import genArrayLike from '/utils/genArrayLike.js';

export default (systemName, type) => {
    return genArrayLike(systemName, (store, key, index) => {
        return new type(store._encoded[key][index][0].length);
    });
};
