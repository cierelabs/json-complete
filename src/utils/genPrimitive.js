import getSystemName from '/utils/getSystemName.js';

export default (systemName, type) => {
    return {
        _identify: (v) => {
            return getSystemName(v) === systemName && !(v instanceof type);
        },
        _encodeValue: (_, dataItem) => {
            return dataItem._reference;
        },
        _generateReference: (store, key, index) => {
            return store._encoded[key][index];
        },
        _build: () => {},
    };
};
