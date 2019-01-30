import genPrimitive from '/utils/genPrimitive.js';
import genTypedArray from '/utils/genTypedArray.js';

export default (typeObj) => {
    /* istanbul ignore else */
    if (typeof BigInt === 'function') {
        typeObj._ = genPrimitive(BigInt, 1);
    }

    /* istanbul ignore else */
    if (typeof BigInt64Array === 'function') {
        typeObj.BI = genTypedArray(BigInt64Array);
    }

    /* istanbul ignore else */
    if (typeof BigUint64Array === 'function') {
        typeObj.BU = genTypedArray(BigUint64Array);
    }

    return typeObj;
};
