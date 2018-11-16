import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import genPrimitive from '/utils/genPrimitive.js';

export default genPrimitive('Number', Number, (store, dataItem) => {
    return encounterItem(store, String(dataItem._reference));
}, (store, key, index) => {
    return parseFloat(decodePointer(store, store._encoded[key][index]));
});
