import genTypedArray from '/utils/genTypedArray.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Int32Array, () => {
    return genTypedArray('Int32Array', Int32Array);
});
