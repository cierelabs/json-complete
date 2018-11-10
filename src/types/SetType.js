import encounterItem from '/utils/encounterItem.js';
import genSetLike from '/utils/genSetLike.js';
import getDecoded from '/utils/getDecoded.js';

export default genSetLike('Set', Set, (store, subValue) => {
    return encounterItem(store, subValue);
}, (store, addTo, subPointer) => {
    addTo.add(getDecoded(store, subPointer));
});
