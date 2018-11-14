import genTypedArray from '/utils/genTypedArray.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Float32Array, () => {
    return genTypedArray('Float32Array', Float32Array);
});
