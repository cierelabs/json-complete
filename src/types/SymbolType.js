import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import genDoesMatchSystemName from '/utils/genDoesMatchSystemName.js';
import tryCreateType from '/utils/tryCreateType.js';

export default tryCreateType(typeof Symbol, () => {
    return {
        _identify: genDoesMatchSystemName('Symbol'),
        _encodeValue: (store, dataItem) => {
            const symbolStringKey = Symbol.keyFor(dataItem._reference);
            const isRegistered = symbolStringKey !== void 0;

            return [
                // For Registered Symbols, specify with true value and store the registered string value
                // For unique Symbols, specify with false value and also store the optional identifying string
                encounterItem(store, isRegistered ? true : false),
                encounterItem(store, isRegistered ? symbolStringKey : String(dataItem._reference).slice(7, -1)),
            ];
        },
        _generateReference: (store, key, index) => {
            const encodedValue = store._encoded[key][index];
            const identifierString = decodePointer(store, encodedValue[1]);

            return decodePointer(store, encodedValue[0]) ? Symbol.for(identifierString) : Symbol(identifierString);
        },
        _build: () => {}, // Symbols doesn't allow attachments, no-op
    };
});