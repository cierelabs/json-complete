import attachKeys from '/utils/attachKeys.js';
import decodePointer from '/utils/decodePointer.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';

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
            return encodeWithAttachments([[
                reference.source,
                getFlags(reference),
                reference.lastIndex,
            ]], attachments);
        },
        _generateReference: (store, dataItems) => {
            const dataArray = dataItems[0];
            const value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
            value.lastIndex = decodePointer(store, dataArray[2]);
            return value;
        },
        _build: (store, dataItem) => {
            attachKeys(store, dataItem, 1, 2);
        },
    };

    return typeObj;
};
