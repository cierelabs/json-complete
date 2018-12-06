import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
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
            return [[
                reference.source,
                getFlags(reference),
                reference.lastIndex,
            ]].concat(attachments._keyed);
        },
        _generateReference: (store, key, index) => {
            const dataArray = store._encoded[key][index][0];
            const value = new RegExp(decodePointer(store, dataArray[0]), decodePointer(store, dataArray[1]));
            value.lastIndex = decodePointer(store, dataArray[2]);
            return value;
        },
        _build: attachAttachmentsSkipFirst,
    };

    return typeObj;
};
