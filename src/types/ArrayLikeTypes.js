import getDecoded from '/utils/getDecoded.js';

export default (typeObj) => {
    typeObj.Ar = {
        _systemName: 'Array',
        _encodeValue: (reference, attachments) => {
            let arr = [attachments._indexed];

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
            return [];
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

    typeObj.rg = {
        _systemName: 'Arguments',
        _encodeValue: (reference, attachments) => {
            let arr = [attachments._indexed];

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
            return (function() {
                return arguments;
            }).apply(null, Array(dataItems[0].length));
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

    return typeObj;
};
