import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import getDecoded from '/utils/getDecoded.js';

export default (typeObj) => {
    // If Set is supported, Map is also supported
    /* istanbul ignore else */
    if (typeof Set === 'function') {
        typeObj.Se = {
            _systemName: 'Set',
            _encodeValue: (reference, attachments) => {
                var arr = [];
                reference.forEach((value) => {
                    arr.push(value);
                });

                return [arr].concat(attachments._keyed);
            },
            _generateReference: () => {
                return new Set();
            },
            _build: (store, dataItem) => {
                dataItem._parts[0].forEach((subPointer) => {
                    dataItem._reference.add(getDecoded(store, subPointer));
                });

                attachAttachmentsSkipFirst(store, dataItem);
            },
        };

        typeObj.Ma = {
            _systemName: 'Map',
            _deepValue: 1,
            _encodeValue: (reference, attachments) => {
                var arr = [];
                reference.forEach((value, key) => {
                    arr.push(key);
                    arr.push(value);
                });

                return [arr].concat(attachments._keyed);
            },
            _generateReference: () => {
                return new Map();
            },
            _build: (store, dataItem) => {
                for (let kv = 0; kv < dataItem._parts[0].length; kv += 2) {
                    dataItem._reference.set(getDecoded(store, dataItem._parts[0][kv]), getDecoded(store, dataItem._parts[0][kv + 1]));
                }

                attachAttachmentsSkipFirst(store, dataItem);
            },
        };
    }

    return typeObj;
};
