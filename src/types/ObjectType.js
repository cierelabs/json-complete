import attachAttachments from '/utils/attachAttachments.js';

export default (typeObj) => {
    typeObj.Ob = {
        _systemName: 'Object',
        _encodeValue: () => {
            return [];
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
