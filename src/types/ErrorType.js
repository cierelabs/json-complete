import attachKeys from '/utils/attachKeys.js';
import decodePointer from '/utils/decodePointer.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';

const standardErrors = {
    'EvalError': EvalError,
    'RangeError': RangeError,
    'ReferenceError': ReferenceError,
    'SyntaxError': SyntaxError,
    'TypeError': TypeError,
    'URIError': URIError,
};

export default (typeObj) => {
    typeObj.E = {
        _systemName: 'Error',
        _encodeValue: (reference, attachments) => {
            return encodeWithAttachments([[
                standardErrors[reference.name] ? reference.name : 'Error',
                reference.message,
                reference.stack,
            ]], attachments);
        },
        _generateReference: (store, dataItems) => {
            const dataArray = dataItems[0];

            const value = new (standardErrors[decodePointer(store, dataArray[0])] || Error)(decodePointer(store, dataArray[1]));
            value.stack = decodePointer(store, dataArray[2]);

            return value;
        },
        _build: (store, dataItem) => {
            attachKeys(store, dataItem, 1, 2);
        },
    };

    return typeObj;
};
