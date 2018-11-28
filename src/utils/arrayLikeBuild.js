import attachAttachmentsSkipFirst from '/utils/attachAttachmentsSkipFirst.js';
import getDecoded from '/utils/getDecoded.js';

export default (store, dataItem) => {
    dataItem._parts[0].forEach((pointer, index) => {
        dataItem._reference[index] = getDecoded(store, pointer);
    });

    attachAttachmentsSkipFirst(store, dataItem);
};
