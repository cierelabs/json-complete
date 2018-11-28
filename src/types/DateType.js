import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';

export default (typeObj) => {
    typeObj.Da = {
        _systemName: 'Date',
        _encodeValue: (store, dataItem) => {
            return [
                encounterItem(store, dataItem._reference.valueOf()),
            ];
        },
        _generateReference: (store, key, index) => {
            return new Date(decodePointer(store, store._encoded[key][index][0]));
        },
        _build: attachAttachmentsSkipFirst,
    };

    return typeObj;
};
