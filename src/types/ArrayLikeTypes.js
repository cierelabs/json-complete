import attachIndices from '/utils/attachIndices.js';
import attachKeys from '/utils/attachKeys.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';

export default (typeObj) => {
    typeObj.Ar = {
        _systemName: 'Array',
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

    typeObj.rg = {
        _systemName: 'Arguments',
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
