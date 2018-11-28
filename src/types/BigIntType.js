import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';

export default (typeObj) => {
    /* istanbul ignore if */
    if (typeof BigInt === 'function') {
        typeObj.Bi = {
            _systemName: 'BigInt',
            _encodeValue: (store, dataItem) => {
                return encounterItem(store, String(dataItem._reference));
            },
            _generateReference: (store, key, index) => {
                return BigInt(decodePointer(store, store._encoded[key][index]));
            },
            _build: () => {},
        };
    }

    return typeObj;
};