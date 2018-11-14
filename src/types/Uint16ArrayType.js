import genTypedArray from '/utils/genTypedArray.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Uint16Array, () => {
    return genTypedArray('Uint16Array', Uint16Array);
});
