import attachAttachments from '/utils/attachAttachments.js';
import genDoesMatchSystemName from '/utils/genDoesMatchSystemName.js';

export default {
    _identify: genDoesMatchSystemName('Object'),
    _encodeValue: () => {
        return [];
    },
    _generateReference: () => {
        return {};
    },
    _build: (store, dataItem) => {
        attachAttachments(store, dataItem, dataItem._parts);
    },
};
