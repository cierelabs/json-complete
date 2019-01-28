import attachKeys from '/utils/attachKeys.js';
import getDecoded from '/utils/getDecoded.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';

export default (typeObj) => {
    // If Set is supported, Map is also supported
    /* istanbul ignore else */
    if (typeof Set === 'function') {
        typeObj.U = {
            _systemName: 'Set',
            _compressionType: 2,
            _encodeValue: (reference, attachments) => {
                const data = [];
                reference.forEach((value) => {
                    data.push(value);
                });

                return encodeWithAttachments([data], attachments);
            },
            _generateReference: () => {
                return new Set();
            },
            _build: (store, dataItem) => {
                dataItem._parts[0].forEach((pointer) => {
                    dataItem._reference.add(getDecoded(store, pointer));
                });

                attachKeys(store, dataItem, 1, 2);
            },
        };

        typeObj.V = {
            _systemName: 'Map',
            _compressionType: 2,
            _encodeValue: (reference, attachments) => {
                const keys = [];
                const values = [];
                reference.forEach((value, key) => {
                    keys.push(key);
                    values.push(value);
                });

                return encodeWithAttachments([keys, values], attachments);
            },
            _generateReference: () => {
                return new Map();
            },
            _build: (store, dataItem) => {
                for (let i = 0; i < dataItem._parts[0].length; i += 1) {
                    dataItem._reference.set(getDecoded(store, dataItem._parts[0][i]), getDecoded(store, dataItem._parts[1][i]));
                }

                attachKeys(store, dataItem, 2, 3);
            },
        };
    }

    return typeObj;
};
