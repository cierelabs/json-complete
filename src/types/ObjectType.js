import attachKeys from '/utils/attachKeys.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';

export default (typeObj) => {
    typeObj.O = {
        _systemName: 'Object',
        _compressionType: 2,
        _encodeValue: (reference, attachments) => {
            return encodeWithAttachments([], attachments);
        },
        _generateReference: () => {
            return {};
        },
        _build: (store, dataItem) => {
            attachKeys(store, dataItem, 0, 1);
        },
    };

    return typeObj;
};
