export default (typeObj) => {
    /* istanbul ignore else */
    if (typeof Symbol === 'function') {
        typeObj.P = {
            _systemName: 'Symbol',
            _compressionType: 0,
            _encodeValue: (reference) => {
                const symbolStringKey = Symbol.keyFor(reference);
                const isRegistered = symbolStringKey !== void 0;

                return isRegistered ? `r${symbolStringKey}` : `s${String(reference).slice(7, -1)}`;
            },
            _generateReference: (store, decodedString) => {
                return decodedString[0] === 'r' ? Symbol.for(decodedString.slice(1)) : Symbol(decodedString.slice(1));
            },
            _build: () => {}, // Symbols do not allow attachments, no-op
        };
    }

    return typeObj;
};
