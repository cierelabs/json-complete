import encounterItem from '/utils/encounterItem.js';
import genSetLike from '/utils/genSetLike.js';
import getDecoded from '/utils/getDecoded.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Set, () => {
    return genSetLike('Set', Set, (store, subValue) => {
        return encounterItem(store, subValue);
    }, (store, addTo, subPointer) => {
        addTo.add(getDecoded(store, subPointer));
    });
});
