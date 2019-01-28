import genTypedArray from '/utils/genTypedArray.js';

export default (typeObj) => {
    // If an environment supports Int8Array, it will support most of the TypedArray types
    /* istanbul ignore else */
    if (typeof Int8Array === 'function') {
        typeObj.IE = genTypedArray(Int8Array);
        typeObj.IS = genTypedArray(Int16Array);
        typeObj.IT = genTypedArray(Int32Array);
        typeObj.$ = genTypedArray(Uint8Array);
        typeObj.US = genTypedArray(Uint16Array);
        typeObj.UT = genTypedArray(Uint32Array);
        typeObj.FT = genTypedArray(Float32Array);
    }

    // IE10 and IE Mobile do not support Uint8ClampedArray
    // https://caniuse.com/#feat=typedarrays
    /* istanbul ignore else */
    if (typeof Uint8ClampedArray === 'function') {
        typeObj.UC = genTypedArray(Uint8ClampedArray);
    }

    // Safari versions prior to 5.1 might not support the Float64ArrayType, even as they support other TypeArray types
    // https://caniuse.com/#feat=typedarrays
    /* istanbul ignore else */
    if (typeof Float64Array === 'function') {
        typeObj.FS = genTypedArray(Float64Array);
    }

    return typeObj;
};
