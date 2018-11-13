import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import getSystemName from '/utils/getSystemName.js';

export default (systemName, type) => {
    return {
        _identify: (v) => {
            return getSystemName(v) === systemName && v instanceof type;
        },
        _encodeValue: (store, dataItem) => {
            return [
                encounterItem(store, dataItem._reference.valueOf()),
            ];
        },
        _generateReference: (store, key, index) => {
            return new type(decodePointer(store, store._encoded[key][index][0]));
        },
        _build: attachAttachmentsSkipFirst,
    };
};
