import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';

export default (typeObj) => {
    /* istanbul ignore else */
    if (typeof Symbol === 'function') {
        typeObj.Sy = {
            _systemName: 'Symbol',
            _encodeValue: (store, dataItem) => {
                const symbolStringKey = Symbol.keyFor(dataItem._reference);
                const isRegistered = symbolStringKey !== void 0;

                return encounterItem(store, isRegistered ? `R${symbolStringKey}` : `S${String(dataItem._reference).slice(7, -1)}`);
            },
            _generateReference: (store, key, index) => {
                const decodedString = decodePointer(store, store._encoded[key][index]);

                return decodedString[0] === 'R' ? Symbol.for(decodedString.slice(1)) : Symbol(decodedString.slice(1));
            },
            _build: () => {}, // Symbols do not allow attachments, no-op
        };
    }

    return typeObj;
};
