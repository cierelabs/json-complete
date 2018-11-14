import genTypedArray from '/utils/genTypedArray.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Uint32Array, () => {
    return genTypedArray('Uint32Array', Uint32Array);
});
