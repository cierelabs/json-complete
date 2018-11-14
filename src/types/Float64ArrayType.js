import genTypedArray from '/utils/genTypedArray.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Float64Array, () => {
    return genTypedArray('Float64Array', Float64Array);
});
