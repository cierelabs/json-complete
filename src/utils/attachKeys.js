import getDecoded from '/utils/getDecoded.js';

export default (store, dataItem, keyIndex, valueIndex) => {
    for (let i = 0; i < (dataItem._parts[keyIndex] || []).length; i += 1) {
        // In compat mode, if Symbol types are not supported, but the encoded data uses a Symbol key, skip this entry
        const key = dataItem._parts[keyIndex][i];
        if (key.slice(0, 2) === 'Sy' && typeof Symbol !== 'function' && store._compat) {
            return;
        }

        dataItem._reference[getDecoded(store, key)] = getDecoded(store, dataItem._parts[valueIndex][i]);
    }
};
