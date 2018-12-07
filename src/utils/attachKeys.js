import getDecoded from '/utils/getDecoded.js';

export default (store, dataItem, keyIndex, valueIndex) => {
    for (let i = 0; i < (dataItem._parts[keyIndex] || []).length; i += 1) {
        dataItem._reference[getDecoded(store, dataItem._parts[keyIndex][i])] = getDecoded(store, dataItem._parts[valueIndex][i]);
    }
};
