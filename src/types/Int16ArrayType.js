import genTypedArray from '/utils/genTypedArray.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Int16Array, () => {
    return genTypedArray('Int16Array', Int16Array);
});
