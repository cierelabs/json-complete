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

                // Set the typed array pointer into the output
                const typedArrayPointer = encounterItem(store, typedArray);
                store._output[dataItem._key][dataItem._index][0][0] = typedArrayPointer;

                // Create new number array here inside an array as if we are exploring it normally
                const typedArrayP = extractPointer(typedArrayPointer);
                store._output[typedArrayP._key][typedArrayP._index] = [
                    Array.from(typedArray).map((subItem) => {
                        const numberPointer = encounterItem(store, subItem);
                        const numberP = extractPointer(numberPointer);

                        // Last step: Since numbers are converted to strings, we have to add them as strings as well and store the pointer to the string in the number index
                        const stringLength = store._output.st.length;
                        store._output.st[stringLength] = String(subItem);
                        store._output[numberP._key][numberP._index] = `st${stringLength}`;

                        return numberPointer;
                    }),
                ];

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
