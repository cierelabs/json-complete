import genPrimitive from '/utils/genPrimitive.js';

export default (typeObj) => {
    /* istanbul ignore if */
    if (typeof BigInt === 'function') {
        typeObj.Bi = genPrimitive(BigInt);
    }

    return typeObj;
};
