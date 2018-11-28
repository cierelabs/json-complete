import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';

export default (typeObj) => {
    typeObj.St = {
        _ignoreIndices: 1, // Strings allow index access into the string value, which is already stored, so ignore indices
        _systemName: 'String',
        _encodeValue: (store, dataItem) => {
            return dataItem._reference;
        },
        _generateReference: (store, key, index) => {
            return store._encoded[key][index];
        },
        _build: () => {},
    };

    typeObj.Nu = {
        _systemName: 'Number',
        _encodeValue: (store, dataItem) => {
            return encounterItem(store, String(dataItem._reference));
        },
        _generateReference: (store, key, index) => {
            return parseFloat(decodePointer(store, store._encoded[key][index]));
        },
        _build: () => {},
    };

    return typeObj;
};
