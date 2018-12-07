import getDecoded from '/utils/getDecoded.js';

export default (store, dataItem) => {
    for (let i = 0; i < dataItem._parts[0].length; i += 1) {
        dataItem._reference[i] = getDecoded(store, dataItem._parts[0][i]);
    }
};
