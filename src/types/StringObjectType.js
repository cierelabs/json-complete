import genPrimitiveObject from '/utils/genPrimitiveObject.js';

export default Object.assign({
    // String Objects allow index access into the string value, which is already stored, so ignore indices
    _ignoreIndices: 1,
}, genPrimitiveObject('String', String));
