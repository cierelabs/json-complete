import getDecoded from '/utils/getDecoded.js';
import decodePointer from '/utils/decodePointer.js';

const getFlags = (reference) => {
    /* istanbul ignore if */
    if (reference.flags === void 0) {
        // Edge and IE use `options` parameter instead of `flags`, regardless of what it says on MDN
        return reference.options;
    }

    return reference.flags;
};

export default (typeObj) => {
    typeObj.Re = {
        _systemName: 'RegExp',
        _encodeValue: (reference, attachments) => {
            let arr = [[
                reference.source,
                getFlags(reference),
                reference.lastIndex,
            ]];

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
            const dataArray = dataItems[0];
            const value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
            value.lastIndex = decodePointer(store, dataArray[2]);
            return value;
        },
        _build: (store, dataItem) => {
            if (dataItem._parts[1]) {
                for (let i = 0; i < dataItem._parts[1].length; i += 1) {
                    dataItem._reference[getDecoded(store, dataItem._parts[1][i])] = getDecoded(store, dataItem._parts[2][i]);
                }
            }
        },
    };

    return typeObj;
};
