import getSystemName from '/utils/getSystemName.js';

export default (type) => {
    return {
        _systemName: getSystemName(type('')),
        _encodeValue: (reference) => {
            return String(reference);
        },
        _generateReference: (store, dataItems) => {
            return type(dataItems);
        },
        _build: () => {},
    };
};
