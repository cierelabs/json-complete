import genPrimitive from '/utils/genPrimitive.js';

export default Object.assign({
    // Strings allow index access into the string value, which is already stored, so ignore indices
    _ignoreIndices: 1,
}, genPrimitive('String', String, (store, dataItem) => {
    return dataItem._reference;
}, (store, key, index) => {
    return store._encoded[key][index];
}));
