import decodePointer from '/utils/decodePointer.js';
import encounterItem from '/utils/encounterItem.js';
import genAttachableValueObject from '/utils/genAttachableValueObject.js';

// Technically, Symbols doesn't allow attachments, so using it as if it is a standard attachable object is a no-op
export default genAttachableValueObject('Symbol', (store, dataItem) => {
    const symbolStringKey = Symbol.keyFor(dataItem._value);
    const isRegistered = symbolStringKey !== void 0;

    return [
        // For Registered Symbols, specify with 1 value and store the registered string value
        // For unique Symbols, specify with 0 value and also store the optional identifying string
        encounterItem(store, isRegistered ? 1 : 0),
        encounterItem(store, isRegistered ? symbolStringKey : String(dataItem._value).slice(7, -1)),
    ];
}, (store, key, index) => {
    const encodedValue = store._encoded[key][index];
    const identifierString = decodePointer(store, encodedValue[1]);

    return decodePointer(store, encodedValue[0]) === 1 ? Symbol.for(identifierString) : Symbol(identifierString);
});
