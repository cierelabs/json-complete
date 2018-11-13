import arrayLikeEncodeValue from '/utils/arrayLikeEncodeValue.js';
import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';
import genDoesMatchSystemName from '/utils/genDoesMatchSystemName.js';

export default (systemName, type) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: (store, dataItem) => {
            dataItem._indices = Array.from(new Uint8Array(dataItem._reference));
            return arrayLikeEncodeValue(store, dataItem);
        },
        _generateReference: (store, key, index) => {
            const encodedValues = store._encoded[key][index][0];
            const buffer = new type(encodedValues.length);
            const view = new Uint8Array(buffer);
            encodedValues.forEach((pointer, index) => {
                view[index] = decodePointer(store, pointer);
            });
            return buffer;
        },
        _build: attachAttachmentsSkipFirst,
    };
};
