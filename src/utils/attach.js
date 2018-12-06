import getDecoded from '/utils/getDecoded.js';

export default (store, dataItem, indicesIndex, keyIndex, valueIndex) => {
    if (indicesIndex >= 0) {
        const indices = getDecoded(store, dataItem._parts[indicesIndex]);
        for (let i = 0; i < indices.length; i += 1) {
            dataItem._reference[i] = getDecoded(store, indices[i]);
        }
    }

    if (keyIndex >= 0 && valueIndex >= 0 && dataItem._parts[keyIndex] !== void 0) {
        const keys = getDecoded(store, dataItem._parts[keyIndex]);
        const values = getDecoded(store, dataItem._parts[valueIndex]);
        for (let i = 0; i < keys.length; i += 1) {
            dataItem._reference[getDecoded(store, keys[i])] = getDecoded(store, values[i]);
        }
    }
};