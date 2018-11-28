import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';

export default (typeObj) => {
    typeObj.Re = {
        _systemName: 'RegExp',
        _encodeValue: (store, dataItem) => {
            const reference = dataItem._reference;
            return [
                [
                    encounterItem(store, reference.source),
                    // Edge and IE use `options` parameter instead of `flags`, regardless of what it says on MDN
                    encounterItem(store, reference.flags === void 0 ? reference.options : reference.flags),
                    encounterItem(store, reference.lastIndex),
                ],
            ];
        },
        _generateReference: (store, key, index) => {
            const dataArray = store._encoded[key][index][0];
            const value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
            value.lastIndex = decodePointer(store, dataArray[2]);
            return value;
        },
        _build: attachAttachmentsSkipFirst,
    };

    return typeObj;
};
