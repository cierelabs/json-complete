import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import extractPointer from '/utils/extractPointer.js';
import genDoesMatchSystemName from '/utils/genDoesMatchSystemName.js';

/* istanbul ignore next */
export default (systemName, propertiesKeys, create) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _deferredEncode: (store, dataItem, callback) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                dataItem._deferredValuePointer = encounterItem(store, new Uint8Array(reader.result));
                callback();
            });
            reader.readAsArrayBuffer(dataItem._reference);
        },
        _encodeValue: (store, dataItem) => {
            return [
                [dataItem._deferredValuePointer].concat(propertiesKeys.map((property) => {
                    return encounterItem(store, dataItem._reference[property]);
                })),
            ];
        },
        _generateReference: (store, key, index) => {
            const dataArray = store._encoded[key][index][0];
            const p = extractPointer(dataArray[0]);

            return create(store, [new Uint8Array(store._encoded[p._key][p._index][0].map((pointer) => {
                return decodePointer(store, pointer);
            }))], dataArray);
        },
        _build: attachAttachmentsSkipFirst,
    };
};
