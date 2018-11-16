import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import genPrimitive from '/utils/genPrimitive.js';
import tryCreateType from '/utils/tryCreateType.js';

/* istanbul ignore next */
export default tryCreateType(typeof BigInt, () => {
    return genPrimitive('BigInt', BigInt, (store, dataItem) => {
        return encounterItem(store, String(dataItem._reference));
    }, (store, key, index) => {
        return BigInt(decodePointer(store, store._encoded[key][index]));
    });
});
