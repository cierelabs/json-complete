import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';
import extractPointer from '/utils/extractPointer.js';

/* istanbul ignore next */
const genBlobLike = (systemName, propertiesKeys, create) => {
    return {
        _systemName: systemName,
        _encodeValue: (reference, attachments) => {
            // Skip the decoding of the main value for now
            return [[void 0].concat(propertiesKeys.map((property) => {
                return reference[property];
            }))].concat(attachments._keyed);
        },
        _deferredEncode: (reference, dataArray, encoder, callback) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                dataArray[0][0] = encoder(new Uint8Array(reader.result));
                callback();
            });
            reader.readAsArrayBuffer(reference);
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

    // Supported back to IE10, but IE10, IE11, and (so far) Edge do not support the File constructor
    /* istanbul ignore if */
    if (typeof File === 'function') {
        typeObj.Fi = genBlobLike('File', ['type', 'name', 'lastModified'], (store, buffer, dataArray) => {
            try {
                return new File(buffer, decodePointer(store, dataArray[2]), {
                    type: decodePointer(store, dataArray[1]),
                    lastModified: decodePointer(store, dataArray[3])
                });
            } catch (e) {
                // IE10, IE11, and Edge does not support the File constructor
                // In compat mode, decoding an encoded File object results in a Blob that is duck-typed to be like a File object
                // Such a Blob will still report its System Name as "Blob" instead of "File"
                if (store._compat) {
                    const fallbackBlob = new Blob(buffer, {
                        type: decodePointer(store, dataArray[1]),
                    });

                    fallbackBlob.name = decodePointer(store, dataArray[2]);
                    fallbackBlob.lastModified = decodePointer(store, dataArray[3]);

                    return fallbackBlob;
                }

                throw e;
            }
        });
    }

    return typeObj;
};
