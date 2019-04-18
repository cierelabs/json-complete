import genTypedArray from '/utils/genTypedArray.js';

// Some TypedArray types are not supported by some browsers, so test for all
// https://caniuse.com/#feat=typedarrays
export default (typeObj) => {
    /* istanbul ignore else */
    if (typeof Int8Array === 'function') {
        typeObj.IE = genTypedArray(Int8Array);
    }

    /* istanbul ignore else */
    if (typeof Int16Array === 'function') {
        typeObj.IS = genTypedArray(Int16Array);
    }

    /* istanbul ignore else */
    if (typeof Int32Array === 'function') {
        typeObj.IT = genTypedArray(Int32Array);
    }

    /* istanbul ignore else */
    if (typeof Uint8Array === 'function') {
        typeObj.UE = genTypedArray(Uint8Array);
    }

    /* istanbul ignore else */
    if (typeof Uint8ClampedArray === 'function') {
        typeObj.UC = genTypedArray(Uint8ClampedArray);
    }

    /* istanbul ignore else */
    if (typeof Uint16Array === 'function') {
        typeObj.US = genTypedArray(Uint16Array);
    }

    /* istanbul ignore else */
    if (typeof Uint32Array === 'function') {
        typeObj.UT = genTypedArray(Uint32Array);
    }

    /* istanbul ignore else */
    if (typeof Float32Array === 'function') {
        typeObj.FT = genTypedArray(Float32Array);
    }

    /* istanbul ignore else */
    if (typeof Float64Array === 'function') {
        typeObj.FS = genTypedArray(Float64Array);
    }

    return typeObj;
};
