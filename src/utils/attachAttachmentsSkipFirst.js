import attachAttachments from '/utils/attachAttachments.js';

export default (store, dataItem) => {
    attachAttachments(store, dataItem, dataItem._parts.slice(1));
};
