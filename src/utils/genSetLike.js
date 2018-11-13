import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import genDoesMatchSystemName from '/utils/genDoesMatchSystemName.js';

export default (systemName, type, encodeSubValue, buildSubPointers) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: (store, dataItem) => {
            return [
                Array.from(dataItem._reference).map((subValue) => {
                    return encodeSubValue(store, subValue);
                }),
            ];
        },
        _generateReference: () => {
            return new type();
        },
        _build: (store, dataItem) => {
            dataItem._parts[0].forEach((subPointers) => {
                buildSubPointers(store, dataItem._reference, subPointers);
            });

            attachAttachmentsSkipFirst(store, dataItem);
        },
    };
};
