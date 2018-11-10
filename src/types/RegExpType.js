import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import genAttachableValueObject from '/utils/genAttachableValueObject.js';

export default genAttachableValueObject('RegExp', (store, dataItem) => {
    return [
        [
            encounterItem(store, dataItem._value.source),
            encounterItem(store, dataItem._value.flags),
            encounterItem(store, dataItem._value.lastIndex),
        ],
    ];
}, (store, key, index) => {
    const dataArray = store._encoded[key][index][0];
    const value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
    value.lastIndex = decodePointer(store, dataArray[2]);
    return value;
});
