import attachKeys from '/utils/attachKeys.js';
import decodePointer from '/utils/decodePointer.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';
import getSystemName from '/utils/getSystemName.js';

const genArrayBuffer = (type) => {
    return {
        _systemName: getSystemName(new type()),
        _compressionType: 2,
        _encodeValue: (reference, attachments) => {
            return encodeWithAttachments([Array.prototype.slice.call(new Uint8Array(reference))], attachments);
        },
        _generateReference: (store, dataItems) => {
            const encodedValues = dataItems[0];
            const buffer = new type(encodedValues.length);
            const view = new Uint8Array(buffer);
            encodedValues.forEach((pointer, index) => {
                view[index] = decodePointer(store, pointer);
            });
            return buffer;
        },
        _build: (store, dataItem) => {
            // No indices because actual indices are used to fill the buffer, so regular index attachments are actually keys
            attachKeys(store, dataItem, 1, 2);
        },
    };
};

export default (typeObj) => {
    /* istanbul ignore else */
    if (typeof ArrayBuffer === 'function') {
        typeObj.W = genArrayBuffer(ArrayBuffer);
    }

    // Support does not exist or was removed from most environments due to Spectre and Meltdown vulnerabilities
    // https://caniuse.com/#feat=sharedarraybuffer
    /* istanbul ignore else */
    if (typeof SharedArrayBuffer === 'function') {
        typeObj.X = genArrayBuffer(SharedArrayBuffer);
    }

    return typeObj;
};
