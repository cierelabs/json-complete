import arrayLikeBuild from '/utils/arrayLikeBuild.js';

export default (typeObj) => {
    typeObj.Ar = {
        _systemName: 'Array',
        _encodeValue: (reference, attachments) => {
            return [attachments._indexed].concat(attachments._keyed);
        },
        _generateReference: () => {
            return [];
        },
        _build: arrayLikeBuild,
    };

    typeObj.rg = {
        _systemName: 'Arguments',
        _encodeValue: (reference, attachments) => {
            return [attachments._indexed].concat(attachments._keyed);
        },
        _generateReference: (store, dataItems) => {
            return (function() {
                return arguments;
            }).apply(null, Array(dataItems[0].length));
        },
        _build: arrayLikeBuild,
    };

    return typeObj;
};
