import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';

const standardErrors = {
    'EvalError': EvalError,
    'RangeError': RangeError,
    'ReferenceError': ReferenceError,
    'SyntaxError': SyntaxError,
    'TypeError': TypeError,
    'URIError': URIError,
};

export default (typeObj) => {
    typeObj.Er = {
        _systemName: 'Error',
        _encodeValue: (reference, attachments) => {
            return [[
                standardErrors[reference.name] ? reference.name : 'Error',
                reference.message,
                reference.stack,
            ]].concat(attachments._keyed);
        },
        _generateReference: (store, dataItems) => {
            const dataArray = dataItems[0];

            const value = new (standardErrors[decodePointer(store, dataArray[0])] || Error)(decodePointer(store, dataArray[1]));
            value.stack = decodePointer(store, dataArray[2]);

            return value;
        },
        _build: attachAttachmentsSkipFirst,
    };

    return typeObj;
};
