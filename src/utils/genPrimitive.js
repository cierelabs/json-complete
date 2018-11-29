import getSystemName from '/utils/getSystemName.js';

export default (type) => {
    return {
        _systemName: getSystemName(type('')),
        _encodeValue: (store, dataItem) => {
            return String(dataItem._reference);
        },
        _generateReference: (store, key, index) => {
            return type(store._encoded[key][index]);
        },
        _build: () => {},
    };
};
