export default (typeObj) => {
    /* istanbul ignore else */
    if (typeof Symbol === 'function') {
        typeObj.Sy = {
            _systemName: 'Symbol',
            _encodeValue: (reference) => {
                const symbolStringKey = Symbol.keyFor(reference);
                const isRegistered = symbolStringKey !== void 0;

                return isRegistered ? `R${symbolStringKey}` : ` ${String(reference).slice(7, -1)}`;
            },
            _generateReference: (store, decodedString) => {
                return decodedString[0] === 'R' ? Symbol.for(decodedString.slice(1)) : Symbol(decodedString.slice(1));
            },
            _build: () => {}, // Symbols do not allow attachments, no-op
        };
    }

    return typeObj;
};
