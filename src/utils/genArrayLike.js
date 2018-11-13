import arrayLikeEncodeValue from '/utils/arrayLikeEncodeValue.js';
import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import genDoesMatchSystemName from '/utils/genDoesMatchSystemName.js';
import getDecoded from '/utils/getDecoded.js';

export default (systemName, generateReference) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: arrayLikeEncodeValue,
        _generateReference: generateReference,
        _build: (store, dataItem) => {
            dataItem._parts[0].forEach((pointer, index) => {
                dataItem._reference[index] = getDecoded(store, pointer);
            });

            attachAttachmentsSkipFirst(store, dataItem);
        },
    };
};
