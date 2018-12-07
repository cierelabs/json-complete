import getDecoded from '/utils/getDecoded.js';

export default (typeObj) => {
    // If Set is supported, Map is also supported
    /* istanbul ignore else */
    if (typeof Set === 'function') {
        typeObj.Se = {
            _systemName: 'Set',
            _encodeValue: (reference, attachments) => {
                const data = [];
                reference.forEach((value) => {
                    data.push(value);
                });

                let arr = [data];

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
                return new Set();
            },
            _build: (store, dataItem) => {
                dataItem._parts[0].forEach((pointer) => {
                    dataItem._reference.add(getDecoded(store, pointer));
                });

                if (dataItem._parts[1]) {
                    for (let i = 0; i < dataItem._parts[1].length; i += 1) {
                        dataItem._reference[getDecoded(store, dataItem._parts[1][i])] = getDecoded(store, dataItem._parts[2][i]);
                    }
                }
            },
        };

        typeObj.Ma = {
            _systemName: 'Map',
            _deepValue: 1,
            _encodeValue: (reference, attachments) => {
                const keys = [];
                const values = [];
                reference.forEach((value, key) => {
                    keys.push(key);
                    values.push(value);
                });

                let arr = [keys, values];

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
                return new Map();
            },
            _build: (store, dataItem) => {
                for (let i = 0; i < dataItem._parts[0].length; i += 1) {
                    dataItem._reference.set(getDecoded(store, dataItem._parts[0][i]), getDecoded(store, dataItem._parts[1][i]));
                }

                if (dataItem._parts[2]) {
                    for (let i = 0; i < dataItem._parts[2].length; i += 1) {
                        dataItem._reference[getDecoded(store, dataItem._parts[2][i])] = getDecoded(store, dataItem._parts[3][i]);
                    }
                }
            },
        };
    }

    return typeObj;
};
