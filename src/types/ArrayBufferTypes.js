import getDecoded from '/utils/getDecoded.js';
import decodePointer from '/utils/decodePointer.js';
import getSystemName from '/utils/getSystemName.js';

const genArrayBuffer = (type) => {
    return {
        _systemName: getSystemName(new type()),
        _encodeValue: (reference, attachments) => {
            let arr = [Array.prototype.slice.call(new Uint8Array(reference))];

            if (attachments._keyed.length > 0) {
                arr = arr.concat([attachments._keyed.map((value) => {
                    return value[0];
                })], [attachments._keyed.map((value) => {
                    return value[1];
                })]);
            }

            return arr;
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
            dataItem._parts[0].forEach((pointer, index) => {
                dataItem._reference[index] = getDecoded(store, pointer);
            });

            if (dataItem._parts[1]) {
                for (let i = 0; i < dataItem._parts[1].length; i += 1) {
                    dataItem._reference[getDecoded(store, dataItem._parts[1][i])] = getDecoded(store, dataItem._parts[2][i]);
                }
            }
        },
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
