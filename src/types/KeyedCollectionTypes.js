import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import encounterItem from '/utils/encounterItem.js';
import getDecoded from '/utils/getDecoded.js';

export default (typeObj) => {
    // If Set is supported, Map is also supported
    /* istanbul ignore else */
    if (typeof Set === 'function') {
        typeObj.Se = {
            _systemName: 'Set',
            _encodeValue: (store, dataItem) => {
                return [
                    Array.from(dataItem._reference).map((subValue) => {
                        return encounterItem(store, subValue);
                    }),
                ];
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
            _encodeValue: (store, dataItem) => {
                return [
                    Array.from(dataItem._reference).map((subValue) => {
                        return [encounterItem(store, subValue[0]), encounterItem(store, subValue[1])];
                    }),
                ];
            },
            _generateReference: () => {
                return new Map();
            },
            _build: (store, dataItem) => {
                dataItem._parts[0].forEach((subPointers) => {
                    dataItem._reference.set(getDecoded(store, subPointers[0]), getDecoded(store, subPointers[1]));
                });

                attachAttachmentsSkipFirst(store, dataItem);
            },
        };
    }

    return typeObj;
};
