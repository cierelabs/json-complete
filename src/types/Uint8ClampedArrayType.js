import genTypedArray from '/utils/genTypedArray.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Uint8ClampedArray, () => {
    return genTypedArray('Uint8ClampedArray', Uint8ClampedArray);
});
