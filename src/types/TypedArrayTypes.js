import arrayLikeBuild from '/utils/arrayLikeBuild.js';
import arrayLikeEncodeValue from '/utils/arrayLikeEncodeValue.js';
import getSystemName from '/utils/getSystemName.js';

const genTypedArray = (type) => {
    return {
        _systemName: getSystemName(new type()),
        _encodeValue: arrayLikeEncodeValue,
        _generateReference: (store, dataItems) => {
            return new type(dataItems[0].length);
        },
        _build: arrayLikeBuild,
    };
};

export default (typeObj) => {
    // If an environment supports Int8Array, it will support most of the TypedArray types
    /* istanbul ignore else */
    if (typeof Int8Array === 'function') {
        typeObj.I1 = genTypedArray(Int8Array);
        typeObj.I2 = genTypedArray(Int16Array);
        typeObj.I3 = genTypedArray(Int32Array);
        typeObj.U1 = genTypedArray(Uint8Array);
        typeObj.U2 = genTypedArray(Uint16Array);
        typeObj.U3 = genTypedArray(Uint32Array);
        typeObj.F3 = genTypedArray(Float32Array);
    }

    // IE10 and IE Mobile do not support Uint8ClampedArray
    // https://caniuse.com/#feat=typedarrays
    /* istanbul ignore else */
    if (typeof Uint8ClampedArray === 'function') {
        typeObj.C1 = genTypedArray(Uint8ClampedArray);
    }

    // Safari versions prior to 5.1 might not support the Float64ArrayType, even as they support other TypeArray types
    // https://caniuse.com/#feat=typedarrays
    /* istanbul ignore else */
    if (typeof Float64Array === 'function') {
        typeObj.F4 = genTypedArray(Float64Array);
    }

    return typeObj;
};
