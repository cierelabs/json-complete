import arrayLikeBuild from '/utils/arrayLikeBuild.js';
import encounterItem from '/utils/encounterItem.js';

export default (typeObj) => {
    typeObj.Ar = {
        _systemName: 'Array',
        _encodeValue: (store, dataItem) => {
            return [
                dataItem._indexed.map((subValue) => {
                    return encounterItem(store, subValue);
                }),
            ];
        },
        _generateReference: () => {
            return [];
        },
        _build: arrayLikeBuild,
    };

    typeObj.rg = {
        _systemName: 'Arguments',
        _encodeValue: (store, dataItem) => {
            return [
                dataItem._indexed.map((subValue) => {
                    return encounterItem(store, subValue);
                }),
            ];
        },
        _generateReference: (store, key, index) => {
            return (function() {
                return arguments;
            }).apply(null, Array(store._encoded[key][index][0].length));
        },
        _build: arrayLikeBuild,
    };

    return typeObj;
};
