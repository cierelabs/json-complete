import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import genAttachableValueObject from '/utils/genAttachableValueObject.js';

const standardErrors = {
    'EvalError': EvalError,
    'RangeError': RangeError,
    'ReferenceError': ReferenceError,
    'SyntaxError': SyntaxError,
    'TypeError': TypeError,
    'URIError': URIError,
};

export default genAttachableValueObject('Error', (store, dataItem) => {
    return [
        [
            encounterItem(store, standardErrors[dataItem._reference.name] ? dataItem._reference.name : 'Error'),
            encounterItem(store, dataItem._reference.message),
            encounterItem(store, dataItem._reference.stack),
        ],
    ];
}, (store, key, index) => {
    const dataArray = store._encoded[key][index][0];

    const value = new (standardErrors[decodePointer(store, dataArray[0])] || Error)(decodePointer(store, dataArray[1]));
    value.stack = decodePointer(store, dataArray[2]);

    return value;
});
