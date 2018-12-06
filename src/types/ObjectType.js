import attachAttachments from '/utils/attachAttachments.js';

export default (typeObj) => {
    typeObj.Ob = {
        _systemName: 'Object',
        _encodeValue: (reference, attachments) => {
            return attachments._keyed;
        },
        _generateReference: () => {
            return {};
        },
        _build: (store, dataItem) => {
            attachAttachments(store, dataItem, dataItem._parts);
        },
    };

    return typeObj;
};
