import attachIndices from '/utils/attachIndices.js';
import attachKeys from '/utils/attachKeys.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';
import getSystemName from '/utils/getSystemName.js';

export default (type) => {
    return {
        _systemName: getSystemName(new type()),
        _compressionType: 2,
        _encodeValue: (reference, attachments) => {
            return encodeWithAttachments([attachments._indices], attachments);
        },
        _generateReference: (store, dataItems) => {
            return new type(dataItems[0].length);
        },
        _build: (store, dataItem) => {
            attachIndices(store, dataItem);
            attachKeys(store, dataItem, 1, 2);
        },
    };
};
