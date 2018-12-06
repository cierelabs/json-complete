import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';

export default (typeObj) => {
    typeObj.Da = {
        _systemName: 'Date',
        _encodeValue: (reference, attachments) => {
            return [reference.valueOf()].concat(attachments._keyed);
        },
        _generateReference: (store, dataItems) => {
            return new Date(decodePointer(store, dataItems[0]));
        },
        _build: attachAttachmentsSkipFirst,
    };

    return typeObj;
};
