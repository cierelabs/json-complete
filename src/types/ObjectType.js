import getDecoded from '/utils/getDecoded.js';

export default (typeObj) => {
    typeObj.Ob = {
        _systemName: 'Object',
        _encodeValue: (reference, attachments) => {
            let arr = [];

            if (attachments._keyed.length > 0) {
                arr = arr.concat([attachments._keyed.map((value) => {
                    return value[0];
                })], [attachments._keyed.map((value) => {
                    return value[1];
                })]);
            }

            return arr;
        },
        _generateReference: () => {
            return {};
        },
        _build: (store, dataItem) => {
            if (dataItem._parts[0]) {
                for (let i = 0; i < dataItem._parts[0].length; i += 1) {
                    dataItem._reference[getDecoded(store, dataItem._parts[0][i])] = getDecoded(store, dataItem._parts[1][i]);
                }
            }
        },
    };

    return typeObj;
};
