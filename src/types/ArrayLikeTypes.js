import attachIndices from '/utils/attachIndices.js';
import attachKeys from '/utils/attachKeys.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';

export default (typeObj) => {
    typeObj.A = {
        _systemName: 'Array',
        _compressionType: 2,
        _encodeValue: (reference, attachments) => {
            return encodeWithAttachments([attachments._indices], attachments);
        },
        _generateReference: () => {
            return [];
        },
        _build: (store, dataItem) => {
            attachIndices(store, dataItem);
            attachKeys(store, dataItem, 1, 2);
        },
    };

    typeObj.Q = {
        _systemName: 'Arguments',
        _compressionType: 2,
        _encodeValue: (reference, attachments) => {
            return encodeWithAttachments([attachments._indices], attachments);
        },
        _generateReference: (store, dataItems) => {
            return (function() {
                return arguments;
            }).apply(null, Array(dataItems[0].length));
        },
        _build: (store, dataItem) => {
            attachIndices(store, dataItem);
            attachKeys(store, dataItem, 1, 2);
        },
    };

    return typeObj;
};
