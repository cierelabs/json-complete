import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import genDoesMatchSystemName from '/utils/genDoesMatchSystemName.js';

export default (systemName, encodeValue, generateReference) => {
    return {
        _identify: genDoesMatchSystemName(systemName),
        _encodeValue: encodeValue,
        _generateReference: generateReference,
        _build: attachAttachmentsSkipFirst,
    };
};
