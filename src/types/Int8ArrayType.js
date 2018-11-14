import genTypedArray from '/utils/genTypedArray.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Int8Array, () => {
    return genTypedArray('Int8Array', Int8Array);
});
