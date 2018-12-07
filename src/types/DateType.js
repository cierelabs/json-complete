import attachKeysStandard from '/utils/attachKeysStandard.js';
import decodePointer from '/utils/decodePointer.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';


export default (typeObj) => {
    typeObj.Da = {
        _systemName: 'Date',
        _encodeValue: (reference, attachments) => {
            return encodeWithAttachments([reference.valueOf()], attachments);
        },
        _generateReference: (store, dataItems) => {
            return new Date(decodePointer(store, dataItems[0]));
        },
        _build: attachKeysStandard,
    };

    return typeObj;
};
