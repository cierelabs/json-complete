import getDecoded from '/utils/getDecoded.js';
import decodePointer from '/utils/decodePointer.js';
import getSystemName from '/utils/getSystemName.js';

const genWrappedPrimitive = (type) => {
    return {
        // Prefix of _ is used to differenciate the Wrapped Primitive vs the Primitive Type
        _systemName: `_${getSystemName(new type(''))}`,
        _encodeValue: (reference, attachments) => {
            let arr = [reference.valueOf()];

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
            return new type(decodePointer(store, dataItems[0]));
        },
        _build: (store, dataItem) => {
            if (dataItem._parts[1]) {
                for (let i = 0; i < dataItem._parts[1].length; i += 1) {
                    dataItem._reference[getDecoded(store, dataItem._parts[1][i])] = getDecoded(store, dataItem._parts[2][i]);
                }
            }
        },
    };
};

export default (typeObj) => {
    typeObj.Bo = genWrappedPrimitive(Boolean);

    typeObj.NU = genWrappedPrimitive(Number);

    typeObj.ST = genWrappedPrimitive(String);

    return typeObj;
};
