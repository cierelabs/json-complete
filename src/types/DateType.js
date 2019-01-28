import attachKeys from '/utils/attachKeys.js';
import decodePointer from '/utils/decodePointer.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';

export default (typeObj) => {
    typeObj.D = {
        _systemName: 'Date',
        _encodeValue: (reference, attachments) => {
            return encodeWithAttachments([[reference.valueOf()]], attachments);
        },
        _generateReference: (store, dataItems) => {
            return new Date(decodePointer(store, dataItems[0][0]));
        },
        _build: (store, dataItem) => {
            attachKeys(store, dataItem, 1, 2);
        },
    };

    return typeObj;
};
