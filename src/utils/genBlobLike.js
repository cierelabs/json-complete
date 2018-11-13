import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import extractPointer from '/utils/extractPointer.js';
import genDoesMatchSystemName from '/utils/genDoesMatchSystemName.js';

/* istanbul ignore next */
export default (systemName, propertiesKeys, create) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: (store, dataItem) => {
            return [
                [new Uint8Array(0)].concat(propertiesKeys.map((property) => {
                    return encounterItem(store, dataItem._reference[property]);
                })),
            ];
        },
        _deferredEncode: (store, dataItem, callback) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                const typedArray = new Uint8Array(reader.result);
                const typedArrayPointer = encounterItem(store, typedArray);

                const typedArrayP = extractPointer(typedArrayPointer);

                store._output[typedArrayP._key][typedArrayP._index] = [
                    Array.from(typedArray).map((subItem) => {
                        const numberPointer = encounterItem(store, subItem);
                        const numberP = extractPointer(numberPointer);
                        store._output[numberP._key][numberP._index] = subItem;
                        return numberPointer;
                    }),
                ];
                store._output[dataItem._key][dataItem._index][0][0] = typedArrayPointer;
                callback();
            });
            reader.readAsArrayBuffer(dataItem._reference);
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
