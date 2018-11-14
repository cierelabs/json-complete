import genTypedArray from '/utils/genTypedArray.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Uint8Array, () => {
    return genTypedArray('Uint8Array', Uint8Array);
});
