import encounterItem from '/utils/encounterItem.js';
import genSetLike from '/utils/genSetLike.js';
import getDecoded from '/utils/getDecoded.js';

export default genSetLike('Map', Map, (store, subValue) => {
    return [encounterItem(store, subValue[0]), encounterItem(store, subValue[1])];
}, (store, addTo, subPointers) => {
    addTo.set(getDecoded(store, subPointers[0]), getDecoded(store, subPointers[1]));
});
