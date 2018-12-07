import attachKeysStandard from '/utils/attachKeysStandard.js';
import decodePointer from '/utils/decodePointer.js';
import encodeWithAttachments from '/utils/encodeWithAttachments.js';
import getSystemName from '/utils/getSystemName.js';

const genWrappedPrimitive = (type) => {
    return {
        // Prefix of _ is used to differenciate the Wrapped Primitive vs the Primitive Type
        _systemName: `_${getSystemName(new type(''))}`,
        _encodeValue: (reference, attachments) => {
            return encodeWithAttachments([reference.valueOf()], attachments);
        },
        _generateReference: (store, dataItems) => {
            return new type(decodePointer(store, dataItems[0]));
        },
        _build: attachKeysStandard,
    };
};

export default (typeObj) => {
    typeObj.Bo = genWrappedPrimitive(Boolean);

    typeObj.NU = genWrappedPrimitive(Number);

    typeObj.ST = genWrappedPrimitive(String);

    return typeObj;
};
