import arrayLikeBuild from '/utils/arrayLikeBuild.js';
import arrayLikeEncodeValue from '/utils/arrayLikeEncodeValue.js';

export default (typeObj) => {
    typeObj.Ar = {
        _systemName: 'Array',
        _encodeValue: arrayLikeEncodeValue,
        _generateReference: () => {
            return [];
        },
        _build: arrayLikeBuild,
    };

    typeObj.rg = {
        _systemName: 'Arguments',
        _encodeValue: arrayLikeEncodeValue,
        _generateReference: (store, dataItems) => {
            return (function() {
                return arguments;
            }).apply(null, Array(dataItems[0].length));
        },
        _build: arrayLikeBuild,
    };

    return typeObj;
};
