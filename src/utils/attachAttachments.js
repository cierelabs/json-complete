import getDecoded from '/utils/getDecoded.js';

export default (store, dataItem, attachments) => {
    attachments.forEach((pair) => {
        dataItem._reference[getDecoded(store, pair[0])] = getDecoded(store, pair[1]);
    });
};
