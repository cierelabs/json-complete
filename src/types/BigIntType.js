import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import getSystemName from '/utils/getSystemName.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof BigInt, () => {
    return {
        _identify: (v) => {
            return getSystemName(v) === 'BigInt';
        },
        _encodeValue: (store, dataItem) => {
            return encounterItem(store, String(dataItem._reference));
        },
        _generateReference: (store, key, index) => {
            return BigInt(decodePointer(store, store._encoded[key][index]));
        },
        _build: () => {},
    };
});
