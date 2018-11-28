import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';

const genWrappedPrimitive = (type) => {
    return {
        // The type is determined elsewhere
        _systemName: '',
        _encodeValue: (store, dataItem) => {
            return [
                encounterItem(store, dataItem._reference.valueOf()),
            ];
        },
        _generateReference: (store, key, index) => {
            return new type(decodePointer(store, store._encoded[key][index][0]));
        },
        _build: attachAttachmentsSkipFirst,
    };
};

export default (typeObj) => {
    typeObj.Bo = genWrappedPrimitive(Boolean);

    typeObj.NU = genWrappedPrimitive(Number);

    typeObj.ST = genWrappedPrimitive(String);

    // String Objects allow index access into the string value, which is already stored, so ignore indices
    typeObj.ST._ignoreIndices = 1;

    return typeObj;
};
