import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import extractPointer from '/utils/extractPointer.js';

/* istanbul ignore next */
const genBlobLike = (systemName, propertiesKeys, create) => {
    return {
        _systemName: systemName,
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

export default (typeObj) => {
    // Supported back to IE10
    /* istanbul ignore if */
    if (typeof Blob === 'function') {
        typeObj.Bl = genBlobLike('Blob', ['type'], (store, buffer, dataArray) => {
            return new Blob(buffer, {
                type: decodePointer(store, dataArray[1]),
            });
        });
    }

    // Supported back to IE10, but it doesn't support the File constructor
    /* istanbul ignore if */
    if (typeof File === 'function') {
        typeObj.Fi = genBlobLike('File', ['name', 'type', 'lastModified'], (store, buffer, dataArray) => {
            return new File(buffer, decodePointer(store, dataArray[1]), {
                type: decodePointer(store, dataArray[2]),
                lastModified: decodePointer(store, dataArray[3])
            });
        });
    }

    return typeObj;
};
