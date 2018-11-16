import getSystemName from '/utils/getSystemName.js';

export default (systemName, type, encodeValue, generateReference) => {
    return {
        _identify: (v) => {
            return getSystemName(v) === systemName && !(v instanceof type);
        },
        _encodeValue: encodeValue,
        _generateReference: generateReference,
        _build: () => {},
    };
};
