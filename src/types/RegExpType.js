import attachKeys from '/utils/attachKeys.js';
import decodePointer from '/utils/decodePointer.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';
import getSystemName from '/utils/getSystemName.js';

const supportsFlag = (flag) => {
    try {
        const value = new RegExp(' ', flag);
        return getSystemName(value) === 'RegExp';
    } catch(e) {
        // Only false in IE11 and below
        /* istanbul ignore next */
        return false;
    }
};

const supportsSticky = supportsFlag('y');
const supportsUnicode = supportsFlag('u');

export default (typeObj) => {
    typeObj.R = {
        _systemName: 'RegExp',
        _compressionType: 2,
        _encodeValue: (reference, attachments) => {
            let flags = reference.flags;

            // Edge and IE use `options` parameter instead of `flags`, regardless of what it says on MDN
            /* istanbul ignore if */
            if (flags === void 0) {
                flags = reference.options;
            }

            return encodeWithAttachments([[
                reference.source,
                flags,
                reference.lastIndex,
            ]], attachments);
        },
        _generateReference: (store, dataItems) => {
            const dataArray = dataItems[0];
            let flags = decodePointer(store, dataArray[1]);

            // Only applies to IE
            /* istanbul ignore next */
            if (store._compat) {
                if (!supportsSticky) {
                    flags = flags.replace(/y/g, '');
                }

                if (!supportsUnicode) {
                    flags = flags.replace(/u/g, '');
                }
            }

            const value = new RegExp(decodePointer(store, dataArray[0]), flags);
            value.lastIndex = decodePointer(store, dataArray[2]);
            return value;
        },
        _build: (store, dataItem) => {
            attachKeys(store, dataItem, 1, 2);
        },
    };

    return typeObj;
};
