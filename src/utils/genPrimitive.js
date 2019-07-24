import getSystemName from '/utils/getSystemName.js';

export default (type, compressionType) => {
    return {
        _systemName: getSystemName(type('')),
        _compressionType: compressionType || 0,
        _isAttachless: 1,
        _encodeValue: (reference) => {
            return String(reference);
        },
        _generateReference: (store, dataItems) => {
            return type(dataItems);
        },
        _build: () => {},
    };
};
