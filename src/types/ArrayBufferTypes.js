import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import decodePointer from '/utils/decodePointer.js';
import getSystemName from '/utils/getSystemName.js';

const genArrayBuffer = (type) => {
    return {
        _systemName: getSystemName(new type()),
        _encodeValue: (reference, attachments) => {
            return [Array.prototype.slice.call(new Uint8Array(reference))].concat(attachments._keyed);
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

export default (typeObj) => {
    /* istanbul ignore else */
    if (typeof ArrayBuffer === 'function') {
        typeObj.AB = genArrayBuffer(ArrayBuffer);
    }

    // Support does not exist or was removed from most environments due to Spectre and Meltdown vulnerabilities
    // https://caniuse.com/#feat=sharedarraybuffer
    /* istanbul ignore else */
    if (typeof SharedArrayBuffer === 'function') {
        typeObj.Sh = genArrayBuffer(SharedArrayBuffer);
    }

    return typeObj;
};
